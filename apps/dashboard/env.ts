import { requireEnv, requireEnvWhen } from "@cloler/observability";

const enforceSentryDsn = process.env.SENTRY_ENFORCE_DSN === "true";

export function validateDashboardEnv() {
  requireEnv("NEXT_PUBLIC_CONVEX_URL");
  requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  requireEnv("CLERK_SECRET_KEY");

  requireEnvWhen(enforceSentryDsn, "NEXT_PUBLIC_SENTRY_DSN");
  requireEnvWhen(enforceSentryDsn, "SENTRY_DSN");
}

