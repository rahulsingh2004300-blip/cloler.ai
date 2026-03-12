export type LogLevel = "info" | "warn" | "error";
export type LogMeta = Record<string, unknown>;

const SECRET_KEY_PATTERN = /(secret|token|password|api[_-]?key|authorization|cookie|dsn)/i;

type LogPayload = {
  level: LogLevel;
  scope: string;
  message: string;
  timestamp: string;
  metadata?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactByKey(key: string, value: unknown): unknown {
  if (!SECRET_KEY_PATTERN.test(key)) {
    return value;
  }

  if (typeof value !== "string") {
    return "[REDACTED]";
  }

  return redactSecret(value);
}

function sanitizeValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const sanitizedEntries = Object.entries(value).map(([key, nestedValue]) => [
      key,
      redactByKey(key, sanitizeValue(nestedValue, seen)),
    ]);

    return Object.fromEntries(sanitizedEntries);
  }

  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500)}...[truncated]` : value;
  }

  return value;
}

function toLogLine(payload: LogPayload) {
  return JSON.stringify(payload);
}

function writeLog(level: LogLevel, payload: LogPayload) {
  const line = toLogLine(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.warn(line);
}

export function redactSecret(value: string) {
  const trimmed = value.trim();

  if (trimmed.length <= 8) {
    return "[REDACTED]";
  }

  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unknown error",
  };
}

export type Logger = {
  info: (message: string, metadata?: LogMeta) => void;
  warn: (message: string, metadata?: LogMeta) => void;
  error: (message: string, metadata?: LogMeta) => void;
};

export function createLogger(scope: string): Logger {
  return {
    info(message, metadata) {
      writeLog("info", {
        level: "info",
        scope,
        message,
        timestamp: new Date().toISOString(),
        metadata: metadata ? sanitizeValue(metadata) : undefined,
      });
    },
    warn(message, metadata) {
      writeLog("warn", {
        level: "warn",
        scope,
        message,
        timestamp: new Date().toISOString(),
        metadata: metadata ? sanitizeValue(metadata) : undefined,
      });
    },
    error(message, metadata) {
      writeLog("error", {
        level: "error",
        scope,
        message,
        timestamp: new Date().toISOString(),
        metadata: metadata ? sanitizeValue(metadata) : undefined,
      });
    },
  };
}

