import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@cloler/observability";

const logger = createLogger("@cloler/admin/instrumentation");

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    logger.info("Initialized Sentry for Node.js runtime.");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
    logger.info("Initialized Sentry for Edge runtime.");
  }
}

export const onRequestError = Sentry.captureRequestError;
