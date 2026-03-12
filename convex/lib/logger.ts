type LogLevel = "info" | "warn" | "error";

type LogMetadata = Record<string, unknown>;

function normalizeError(error: unknown) {
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

function write(level: LogLevel, event: string, metadata?: LogMetadata) {
  const payload = JSON.stringify({
    level,
    service: "convex",
    event,
    timestamp: new Date().toISOString(),
    metadata,
  });

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

export function createConvexLogger(scope: string) {
  return {
    info(event: string, metadata?: LogMetadata) {
      write("info", `${scope}.${event}`, metadata);
    },
    warn(event: string, metadata?: LogMetadata) {
      write("warn", `${scope}.${event}`, metadata);
    },
    error(event: string, error: unknown, metadata?: LogMetadata) {
      write("error", `${scope}.${event}`, {
        ...metadata,
        error: normalizeError(error),
      });
    },
  };
}
