import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const baseUrl = "https://sentry.io";
const targetEnvFiles = [
  ".env.local",
  path.join("apps", "dashboard", ".env.local"),
  path.join("apps", "admin", ".env.local"),
  path.join("apps", "marketing", ".env.local"),
  path.join("apps", "widget", ".env.local"),
].map((relativePath) => path.join(repoRoot, relativePath));

function normalize(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);
  const values = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (key) {
      values[key] = rawValue;
    }
  }

  return values;
}

function loadEnv() {
  const merged = {};

  for (const filePath of targetEnvFiles) {
    Object.assign(merged, parseEnvFile(filePath));
  }

  Object.assign(merged, process.env);
  return merged;
}

function requireEnv(name, env) {
  const value = normalize(env[name]);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function sentryRequest(token, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `${options.method ?? "GET"} ${pathname} failed with ${response.status}: ${errorBody}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function resolveTeamSlug(token, orgSlug, env) {
  const configuredTeamSlug = normalize(env.SENTRY_TEAM);
  if (configuredTeamSlug) {
    return configuredTeamSlug;
  }

  const teams = await sentryRequest(token, `/api/0/organizations/${orgSlug}/teams/`);

  if (teams.length === 1) {
    return teams[0].slug;
  }

  const teamSlugs = teams.map((team) => team.slug).join(", ");
  throw new Error(
    `SENTRY_TEAM is required because this organization has multiple teams. Available teams: ${teamSlugs}`,
  );
}

async function resolveProject(token, orgSlug, teamSlug, projectSlug, projectName) {
  const projects = await sentryRequest(token, `/api/0/organizations/${orgSlug}/projects/`);
  const existingProject = projects.find((project) => project.slug === projectSlug);

  if (existingProject) {
    return existingProject;
  }

  return sentryRequest(token, `/api/0/teams/${orgSlug}/${teamSlug}/projects/`, {
    method: "POST",
    body: {
      name: projectName,
      slug: projectSlug,
    },
  });
}

function pickPublicDsn(key) {
  return (
    normalize(key?.dsn?.public) ??
    normalize(key?.dsn?.publicUrl) ??
    normalize(key?.publicDsn) ??
    normalize(key?.dsn?.minidump)
  );
}

function pickServerDsn(key, fallback) {
  return normalize(key?.dsn?.secret) ?? normalize(key?.secretDsn) ?? fallback;
}

async function resolveProjectKey(token, orgSlug, projectSlug) {
  const keys = await sentryRequest(token, `/api/0/projects/${orgSlug}/${projectSlug}/keys/`);
  const activeKey = keys.find((key) => key.isActive !== false) ?? keys[0];

  if (!activeKey) {
    throw new Error(`No client keys were returned for Sentry project ${projectSlug}.`);
  }

  const publicDsn = pickPublicDsn(activeKey);
  if (!publicDsn) {
    throw new Error(`Could not resolve a public DSN for Sentry project ${projectSlug}.`);
  }

  return {
    publicDsn,
    serverDsn: pickServerDsn(activeKey, publicDsn),
  };
}

function upsertEnvFile(filePath, updates) {
  let contents = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

  for (const [key, value] of Object.entries(updates)) {
    const safeValue = String(value).replace(/\r?\n/g, " ");
    const pattern = new RegExp(`^${key}=.*$`, "m");

    if (pattern.test(contents)) {
      contents = contents.replace(pattern, `${key}=${safeValue}`);
      continue;
    }

    if (contents.length > 0 && !contents.endsWith("\n")) {
      contents += "\n";
    }

    contents += `${key}=${safeValue}\n`;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

async function main() {
  const env = loadEnv();
  const token = requireEnv("SENTRY_AUTH_TOKEN", env);
  const orgSlug = requireEnv("SENTRY_ORG", env);
  const teamSlug = await resolveTeamSlug(token, orgSlug, env);
  const projectSlug = normalize(env.SENTRY_PROJECT) ?? "cloler-ai-web";
  const projectName = normalize(env.SENTRY_PROJECT_NAME) ?? "cloler.ai web";

  const project = await resolveProject(token, orgSlug, teamSlug, projectSlug, projectName);
  const { publicDsn, serverDsn } = await resolveProjectKey(token, orgSlug, project.slug);

  const updates = {
    NEXT_PUBLIC_SENTRY_DSN: publicDsn,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE:
      normalize(env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) ?? "0.1",
    SENTRY_AUTH_TOKEN: token,
    SENTRY_DSN: serverDsn,
    SENTRY_ENFORCE_DSN: "true",
    SENTRY_ENVIRONMENT: normalize(env.SENTRY_ENVIRONMENT) ?? "development",
    SENTRY_ORG: orgSlug,
    SENTRY_PROJECT: project.slug,
    SENTRY_TEAM: teamSlug,
    SENTRY_TRACES_SAMPLE_RATE: normalize(env.SENTRY_TRACES_SAMPLE_RATE) ?? "0.1",
  };

  for (const filePath of targetEnvFiles) {
    upsertEnvFile(filePath, updates);
  }

  console.info(`[sentry:setup] Ready: ${project.slug}`);
  console.info(`[sentry:setup] Public DSN synced to ${targetEnvFiles.length} env files.`);
  console.info(`[sentry:setup] Open ${baseUrl}/settings/${orgSlug}/projects/${project.slug}/`);
}

main().catch((error) => {
  console.error(`[sentry:setup] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
