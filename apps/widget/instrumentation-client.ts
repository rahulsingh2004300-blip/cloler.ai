import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@cloler/observability";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const logger = createLogger("@cloler/widget/client");

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
});

if (dsn) {
  logger.info("Sentry browser monitoring enabled.");
} else {
  logger.warn("Sentry browser monitoring disabled because NEXT_PUBLIC_SENTRY_DSN is missing.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

