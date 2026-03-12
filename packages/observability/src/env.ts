export type EnvValidationResult = {
  missing: string[];
  values: Record<string, string>;
};

type EnvSource = Record<string, string | undefined>;

type ValidateEnvInput = {
  env: EnvSource;
  required: string[];
};

const runtimeEnv = (
  globalThis as {
    process?: {
      env?: EnvSource;
    };
  }
).process?.env ?? {};

function normalize(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getOptionalEnv(name: string, env: EnvSource = runtimeEnv) {
  return normalize(env[name]);
}

export function getEnv(name: string, fallback: string, env: EnvSource = runtimeEnv) {
  return getOptionalEnv(name, env) ?? fallback;
}

export function requireEnv(name: string, env: EnvSource = runtimeEnv) {
  const value = getOptionalEnv(name, env);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function requireEnvWhen(
  condition: boolean,
  name: string,
  env: EnvSource = runtimeEnv,
) {
  if (!condition) {
    return getOptionalEnv(name, env);
  }

  return requireEnv(name, env);
}

export function validateEnv({ env, required }: ValidateEnvInput): EnvValidationResult {
  const missing = required.filter((name) => !getOptionalEnv(name, env));

  const values: Record<string, string> = {};
  for (const name of required) {
    const value = getOptionalEnv(name, env);
    if (value) {
      values[name] = value;
    }
  }

  return {
    missing,
    values,
  };
}
