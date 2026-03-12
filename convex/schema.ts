import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    clerkOrganizationId: v.optional(v.string()),
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
    .index("by_clerk_organization_id", ["clerkOrganizationId"])
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

  voiceProfiles: defineTable({
    organizationId: v.id("organizations"),
    createdByUserId: v.optional(v.id("users")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    language: v.union(
      v.literal("en-IN"),
      v.literal("hi-IN"),
      v.literal("hinglish"),
    ),
    mode: v.union(v.literal("custom"), v.literal("stock")),
    cloneStatus: v.union(
      v.literal("draft"),
      v.literal("samples_pending"),
      v.literal("ready_for_training"),
      v.literal("training_requested"),
      v.literal("training"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    sampleCount: v.number(),
    generationCount: v.number(),
    defaultForCalls: v.boolean(),
    stockVoiceKey: v.optional(v.string()),
    providerVoiceId: v.optional(v.string()),
    cloneJobRequestedAt: v.optional(v.number()),
    lastCloneJobAt: v.optional(v.number()),
    lastCloneError: v.optional(v.string()),
    lastPreviewGeneratedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization_and_updated_at", ["organizationId", "updatedAt"])
    .index("by_organization_and_slug", ["organizationId", "slug"])
    .index("by_organization_and_default", ["organizationId", "defaultForCalls"]),

  voiceSamples: defineTable({
    organizationId: v.id("organizations"),
    voiceProfileId: v.id("voiceProfiles"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.optional(v.number()),
    sampleKind: v.union(v.literal("reference"), v.literal("preview")),
    uploadStatus: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
  })
    .index("by_voice_profile", ["voiceProfileId"])
    .index("by_organization_and_created_at", ["organizationId", "createdAt"]),

  voiceCloneJobs: defineTable({
    organizationId: v.id("organizations"),
    voiceProfileId: v.id("voiceProfiles"),
    requestedByUserId: v.optional(v.id("users")),
    provider: v.union(v.literal("resonance_pipeline")),
    status: v.union(
      v.literal("queued"),
      v.literal("preparing_samples"),
      v.literal("training"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    sampleCount: v.number(),
    requestedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  })
    .index("by_voice_profile", ["voiceProfileId"])
    .index("by_organization_and_requested_at", ["organizationId", "requestedAt"]),

  voiceGenerations: defineTable({
    organizationId: v.id("organizations"),
    voiceProfileId: v.id("voiceProfiles"),
    requestedByUserId: v.optional(v.id("users")),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    provider: v.union(
      v.literal("sarvam_bulbul_v2"),
      v.literal("sarvam_bulbul_v3"),
      v.literal("custom_preview"),
    ),
    playbackMode: v.optional(
      v.union(v.literal("browser_tts"), v.literal("stored_audio")),
    ),
    text: v.string(),
    characterCount: v.number(),
    generatedSeconds: v.optional(v.number()),
    outputStorageId: v.optional(v.id("_storage")),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_voice_profile", ["voiceProfileId"])
    .index("by_organization_and_created_at", ["organizationId", "createdAt"]),
});
