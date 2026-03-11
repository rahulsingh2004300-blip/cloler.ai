import type { AuthConfig } from "convex/server";

const clerkIssuerDomain =
  (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.CLERK_JWT_ISSUER_DOMAIN ??
  "https://example.clerk.accounts.dev";

const authConfig: AuthConfig = {
  providers: [
    {
      domain: clerkIssuerDomain,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
