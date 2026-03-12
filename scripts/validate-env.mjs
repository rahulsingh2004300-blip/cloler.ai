import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split(/\r?\n/);
  const output = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (key) {
      output[key] = value;
    }
  }

  return output;
}

function mergeEnvSources() {
  const envFiles = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(repoRoot, "apps", "dashboard", ".env"),
    path.join(repoRoot, "apps", "dashboard", ".env.local"),
  ];

  const merged = {};

  for (const filePath of envFiles) {
    Object.assign(merged, parseEnvFile(filePath));
  }

  Object.assign(merged, process.env);
  return merged;
}

function listMissing(env, keys) {
  return keys.filter((key) => {
    const value = env[key];
    return !value || String(value).trim().length === 0;
  });
}

const env = mergeEnvSources();
const isProduction = (env.NODE_ENV ?? "development") === "production";

const requiredKeys = [
  "CONVEX_DEPLOYMENT",
  "CONVEX_URL",
  "CONVEX_SITE_URL",
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_JWT_ISSUER_DOMAIN",
];

const requiredMonitoringKeys = ["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_DSN"];
const missing = listMissing(env, requiredKeys);

if (isProduction) {
  missing.push(...listMissing(env, requiredMonitoringKeys));
}

if (missing.length > 0) {
  console.error("[env:check] Missing required environment variables:");
  for (const key of [...new Set(missing)]) {
    console.error(`  - ${key}`);
  }
  process.exit(1);
}

console.info("[env:check] Environment validation passed.");
