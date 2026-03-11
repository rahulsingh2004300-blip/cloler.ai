import type { Id } from "../_generated/dataModel";
import type { DatabaseReader } from "../_generated/server";

export async function listOrganizationMembers(
  db: DatabaseReader,
  organizationId: Id<"organizations">,
) {
  return db
    .query("users")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
}

export async function listRecentUsageEvents(
  db: DatabaseReader,
  organizationId: Id<"organizations">,
  limit = 12,
) {
  return db
    .query("usageEvents")
    .withIndex("by_organization_and_happened_at", (q) =>
      q.eq("organizationId", organizationId),
    )
    .order("desc")
    .take(limit);
}

export async function listRecentAuditLogs(
  db: DatabaseReader,
  organizationId: Id<"organizations">,
  limit = 6,
) {
  return db
    .query("auditLogs")
    .withIndex("by_organization_and_created_at", (q) =>
      q.eq("organizationId", organizationId),
    )
    .order("desc")
    .take(limit);
}
