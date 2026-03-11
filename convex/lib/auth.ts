import type { UserIdentity } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import type { DatabaseReader } from "../_generated/server";

export const DEFAULT_ORGANIZATION_SLUG = "cloler-demo";
export const DEFAULT_VIEWER_EMAIL = "rahulsingh2004300@gmail.com";
export const DEFAULT_VIEWER_NAME = "Rahul Singh";

type ViewerLookupInput = {
  organizationSlug?: string;
  viewerEmail?: string;
};

export type ViewerContext = {
  organization: Doc<"organizations">;
  actor: {
    type: "user";
    email: string;
    name: string;
    role: "owner" | "operator" | "admin";
    userId: Doc<"users">["_id"];
    clerkUserId: string;
  };
};

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeEmail(value?: string | null) {
  const trimmed = normalizeOptional(value);
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function normalizeSlug(value?: string | null) {
  const trimmed = normalizeOptional(value);
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function readIdentityClaim(identity: UserIdentity, keys: string[]) {
  const claims = identity as Record<string, unknown>;

  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function resolveIdentityOrganization(identity: UserIdentity) {
  return {
    clerkOrganizationId: normalizeOptional(
      readIdentityClaim(identity, ["org_id", "orgId", "organization_id"]),
    ),
    organizationSlug: normalizeSlug(
      readIdentityClaim(identity, ["org_slug", "orgSlug", "organization_slug"]),
    ),
  };
}

export function resolveViewerInput(input?: ViewerLookupInput) {
  return {
    organizationSlug: normalizeSlug(input?.organizationSlug),
    viewerEmail: normalizeEmail(input?.viewerEmail),
  };
}

export async function getOrganizationBySlug(db: DatabaseReader, slug: string) {
  return db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function getOrganizationByClerkId(
  db: DatabaseReader,
  clerkOrganizationId: string,
) {
  return db
    .query("organizations")
    .withIndex("by_clerk_organization_id", (q) =>
      q.eq("clerkOrganizationId", clerkOrganizationId),
    )
    .unique();
}

export async function findAuthenticatedViewerContext(
  db: DatabaseReader,
  identity: UserIdentity,
  input?: ViewerLookupInput,
): Promise<ViewerContext | null> {
  const { organizationSlug, viewerEmail } = resolveViewerInput(input);
  const { clerkOrganizationId, organizationSlug: identityOrganizationSlug } =
    resolveIdentityOrganization(identity);

  let organization = clerkOrganizationId
    ? await getOrganizationByClerkId(db, clerkOrganizationId)
    : null;

  if (!organization) {
    const slugToResolve = organizationSlug ?? identityOrganizationSlug;

    if (!slugToResolve) {
      return null;
    }

    organization = await getOrganizationBySlug(db, slugToResolve);
  }

  if (!organization) {
    return null;
  }

  if (
    clerkOrganizationId &&
    organization.clerkOrganizationId &&
    organization.clerkOrganizationId !== clerkOrganizationId
  ) {
    return null;
  }

  const clerkUserId = normalizeOptional(identity.subject);

  if (!clerkUserId) {
    return null;
  }

  const userByClerkId = await db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();

  const user =
    userByClerkId && userByClerkId.organizationId === organization._id
      ? userByClerkId
      : null;

  if (!user || user.status !== "active") {
    return null;
  }

  const email = normalizeEmail(identity.email) ?? viewerEmail ?? user.email;
  const name = normalizeOptional(identity.name) ?? user.name;

  return {
    organization,
    actor: {
      type: "user",
      email,
      name,
      role: user.role,
      userId: user._id,
      clerkUserId,
    },
  };
}
