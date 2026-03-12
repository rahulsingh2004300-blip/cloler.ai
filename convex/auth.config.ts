import type { AuthConfig } from "convex/server";

function getRequiredClerkIssuerDomain() {
  const value = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.CLERK_JWT_ISSUER_DOMAIN;

  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error(
      "Missing CLERK_JWT_ISSUER_DOMAIN for Convex auth. Set it in your environment before running Convex.",
    );
  }

  return trimmed;
}

const authConfig: AuthConfig = {
  providers: [
    {
      domain: getRequiredClerkIssuerDomain(),
      applicationID: "convex",
    },
  ],
};

export default authConfig;
