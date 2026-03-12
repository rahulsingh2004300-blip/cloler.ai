import { requireEnvWhen } from "@cloler/observability";

const enforceSentryDsn = process.env.SENTRY_ENFORCE_DSN === "true";

export function validateWidgetEnv() {
  requireEnvWhen(enforceSentryDsn, "NEXT_PUBLIC_SENTRY_DSN");
  requireEnvWhen(enforceSentryDsn, "SENTRY_DSN");
}
