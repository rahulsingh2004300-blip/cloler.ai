import type { Doc } from "../_generated/dataModel";
import type { DatabaseReader } from "../_generated/server";

export const DEFAULT_ORGANIZATION_SLUG = "cloler-demo";
export const DEFAULT_VIEWER_EMAIL = "owner@cloler.ai";
export const DEFAULT_VIEWER_NAME = "Rahul Kumar";

export type ViewerContext = {
  organization: Doc<"organizations">;
  actor: {
    type: "user" | "system";
    email: string;
    name: string;
    role: "owner" | "operator" | "admin";
    userId: Doc<"users">["_id"] | null;
  };
};

export function resolveViewerInput(input?: {
  organizationSlug?: string;
  viewerEmail?: string;
}) {
  return {
    organizationSlug:
      input?.organizationSlug?.trim() || DEFAULT_ORGANIZATION_SLUG,
    viewerEmail:
      input?.viewerEmail?.trim().toLowerCase() || DEFAULT_VIEWER_EMAIL,
  };
}

export async function getOrganizationBySlug(db: DatabaseReader, slug: string) {
  return db
    .query("organizations")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function findViewerContext(
  db: DatabaseReader,
  input?: {
    organizationSlug?: string;
    viewerEmail?: string;
  },
): Promise<ViewerContext | null> {
  const { organizationSlug, viewerEmail } = resolveViewerInput(input);
  const organization = await getOrganizationBySlug(db, organizationSlug);

  if (!organization) {
    return null;
  }

  const user = await db
    .query("users")
    .withIndex("by_organization_and_email", (q) =>
      q.eq("organizationId", organization._id).eq("email", viewerEmail),
    )
    .unique();

  if (user) {
    return {
      organization,
      actor: {
        type: "user",
        email: user.email,
        name: user.name,
        role: user.role,
        userId: user._id,
      },
    };
  }

  return {
    organization,
    actor: {
      type: "system",
      email: viewerEmail,
      name: "Platform operator",
      role: "owner",
      userId: null,
    },
  };
}
