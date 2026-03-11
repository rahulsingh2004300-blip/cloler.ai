export const workspaceConfig = {
  organizationSlug:
    process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_SLUG ?? "cloler-demo",
  viewerEmail:
    process.env.NEXT_PUBLIC_DEFAULT_VIEWER_EMAIL ?? "owner@cloler.ai",
  viewerName: process.env.NEXT_PUBLIC_DEFAULT_VIEWER_NAME ?? "Rahul Kumar",
} as const;

export const workspaceArgs = {
  organizationSlug: workspaceConfig.organizationSlug,
  viewerEmail: workspaceConfig.viewerEmail,
} as const;
