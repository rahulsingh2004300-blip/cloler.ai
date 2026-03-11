import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("paused"),
    ),
    plan: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("enterprise"),
    ),
    billingEmail: v.optional(v.string()),
    defaultVoiceTier: v.union(
      v.literal("bulbul_v2"),
      v.literal("bulbul_v3"),
      v.literal("cloned"),
    ),
    telephonyMode: v.union(
      v.literal("inbound"),
      v.literal("outbound"),
      v.literal("hybrid"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_created_at", ["createdAt"]),

  users: defineTable({
    organizationId: v.id("organizations"),
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("operator"),
      v.literal("admin"),
    ),
    status: v.union(
      v.literal("invited"),
      v.literal("active"),
      v.literal("disabled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_and_email", ["organizationId", "email"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  usageEvents: defineTable({
    organizationId: v.id("organizations"),
    eventType: v.union(
      v.literal("telephony"),
      v.literal("voice"),
      v.literal("campaign"),
      v.literal("compliance"),
      v.literal("billing"),
    ),
    metricKey: v.string(),
    quantity: v.number(),
    unitCostInr: v.number(),
    totalCostInr: v.number(),
    source: v.union(
      v.literal("dashboard"),
      v.literal("telephony_service"),
      v.literal("importer"),
      v.literal("system"),
    ),
    happenedAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_organization_and_happened_at", ["organizationId", "happenedAt"]),

  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    actorType: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("service"),
    ),
    actorId: v.optional(v.string()),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    summary: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_organization_and_created_at", ["organizationId", "createdAt"]),
});
