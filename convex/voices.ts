import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { findAuthenticatedViewerContext } from "./lib/auth";
import { createConvexLogger } from "./lib/logger";

const logger = createConvexLogger("voices");

function slugifyVoiceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function requireViewerContext(
  ctx: QueryCtx | MutationCtx,
  organizationSlug?: string,
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required.");
  }

  const viewerContext = await findAuthenticatedViewerContext(ctx.db, identity, {
    organizationSlug,
  });

  if (!viewerContext) {
    throw new Error("Workspace setup is required before managing voices.");
  }

  return viewerContext;
}

async function listVoiceSamplesForProfile(
  ctx: QueryCtx | MutationCtx,
  voiceProfileId: Doc<"voiceProfiles">["_id"],
) {
  return ctx.db
    .query("voiceSamples")
    .withIndex("by_voice_profile", (q) => q.eq("voiceProfileId", voiceProfileId))
    .collect();
}

async function listVoiceGenerationsForProfile(
  ctx: QueryCtx | MutationCtx,
  voiceProfileId: Doc<"voiceProfiles">["_id"],
) {
  return ctx.db
    .query("voiceGenerations")
    .withIndex("by_voice_profile", (q) => q.eq("voiceProfileId", voiceProfileId))
    .collect();
}

async function getVoiceProfileOrThrow(
  ctx: MutationCtx,
  organizationId: Doc<"organizations">["_id"],
  voiceProfileId: Doc<"voiceProfiles">["_id"],
) {
  const voiceProfile = await ctx.db.get(voiceProfileId);

  if (!voiceProfile || voiceProfile.organizationId !== organizationId) {
    throw new Error("Voice profile not found for this organization.");
  }

  return voiceProfile;
}

export const getVoiceLibrary = query({
  args: {
    organizationSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);

    const voiceProfiles = await ctx.db
      .query("voiceProfiles")
      .withIndex("by_organization_and_updated_at", (q) =>
        q.eq("organizationId", viewerContext.organization._id),
      )
      .order("desc")
      .collect();

    const voiceCards = await Promise.all(
      voiceProfiles.map(async (voiceProfile) => {
        const [samples, generations] = await Promise.all([
          listVoiceSamplesForProfile(ctx, voiceProfile._id),
          listVoiceGenerationsForProfile(ctx, voiceProfile._id),
        ]);

        const latestSamples = await Promise.all(
          samples
            .sort((left, right) => right.createdAt - left.createdAt)
            .slice(0, 3)
            .map(async (sample) => ({
              id: sample._id,
              fileName: sample.fileName,
              sizeBytes: sample.sizeBytes,
              contentType: sample.contentType,
              uploadStatus: sample.uploadStatus,
              createdAt: sample.createdAt,
              url: await ctx.storage.getUrl(sample.storageId),
            })),
        );

        const previewCount = generations.filter(
          (generation) => generation.status === "ready",
        ).length;

        return {
          id: voiceProfile._id,
          name: voiceProfile.name,
          slug: voiceProfile.slug,
          description: voiceProfile.description ?? "",
          language: voiceProfile.language,
          mode: voiceProfile.mode,
          cloneStatus: voiceProfile.cloneStatus,
          sampleCount: samples.length,
          generationCount: generations.length,
          previewCount,
          defaultForCalls: voiceProfile.defaultForCalls,
          updatedAt: voiceProfile.updatedAt,
          latestSamples,
        };
      }),
    );

    return {
      organization: {
        id: viewerContext.organization._id,
        name: viewerContext.organization.name,
        slug: viewerContext.organization.slug,
      },
      viewer: viewerContext.actor,
      stats: {
        voiceCount: voiceCards.length,
        totalSamples: voiceCards.reduce(
          (count, voiceProfile) => count + voiceProfile.sampleCount,
          0,
        ),
        readyVoices: voiceCards.filter(
          (voiceProfile) => voiceProfile.cloneStatus === "ready",
        ).length,
        pendingCloneVoices: voiceCards.filter((voiceProfile) =>
          ["ready_for_training", "training_requested", "training"].includes(
            voiceProfile.cloneStatus,
          ),
        ).length,
        previewCount: voiceCards.reduce(
          (count, voiceProfile) => count + voiceProfile.previewCount,
          0,
        ),
      },
      voices: voiceCards,
    };
  },
});

export const createVoiceProfile = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    language: v.union(
      v.literal("en-IN"),
      v.literal("hi-IN"),
      v.literal("hinglish"),
    ),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    const now = Date.now();
    const name = args.name.trim();

    if (name.length < 2) {
      throw new Error("Voice name must be at least 2 characters.");
    }

    const baseSlug = slugifyVoiceName(name) || `voice-${now}`;
    const existingSlug = await ctx.db
      .query("voiceProfiles")
      .withIndex("by_organization_and_slug", (q) =>
        q.eq("organizationId", viewerContext.organization._id).eq("slug", baseSlug),
      )
      .unique();

    const slug = existingSlug ? `${baseSlug}-${String(now).slice(-4)}` : baseSlug;

    const voiceProfileId = await ctx.db.insert("voiceProfiles", {
      organizationId: viewerContext.organization._id,
      createdByUserId: viewerContext.actor.userId,
      name,
      slug,
      description: args.description?.trim() || undefined,
      language: args.language,
      mode: "custom",
      cloneStatus: "draft",
      sampleCount: 0,
      generationCount: 0,
      defaultForCalls: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_profile_created",
      targetType: "voice_profile",
      targetId: voiceProfileId,
      summary: `Created voice profile ${name}.`,
      metadata: {
        language: args.language,
        slug,
      },
      createdAt: now,
    });

    logger.info("voice_profile_created", {
      organizationId: viewerContext.organization._id,
      voiceProfileId,
      slug,
    });

    return {
      voiceProfileId,
      slug,
    };
  },
});

export const generateVoiceSampleUploadUrl = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    voiceProfileId: v.id("voiceProfiles"),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    await getVoiceProfileOrThrow(ctx, viewerContext.organization._id, args.voiceProfileId);

    const uploadUrl = await ctx.storage.generateUploadUrl();

    return { uploadUrl };
  },
});

export const saveUploadedVoiceSample = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    voiceProfileId: v.id("voiceProfiles"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    const voiceProfile = await getVoiceProfileOrThrow(
      ctx,
      viewerContext.organization._id,
      args.voiceProfileId,
    );
    const now = Date.now();

    await ctx.db.insert("voiceSamples", {
      organizationId: viewerContext.organization._id,
      voiceProfileId: voiceProfile._id,
      storageId: args.storageId,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      durationSeconds: args.durationSeconds,
      sampleKind: "reference",
      uploadStatus: "uploaded",
      createdAt: now,
    });

    const nextSampleCount = voiceProfile.sampleCount + 1;
    const nextStatus = nextSampleCount >= 3 ? "ready_for_training" : "samples_pending";

    await ctx.db.patch(voiceProfile._id, {
      sampleCount: nextSampleCount,
      cloneStatus: nextStatus,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_sample_uploaded",
      targetType: "voice_profile",
      targetId: voiceProfile._id,
      summary: `Uploaded reference sample ${args.fileName} to ${voiceProfile.name}.`,
      metadata: {
        sampleCount: nextSampleCount,
        contentType: args.contentType,
        sizeBytes: args.sizeBytes,
      },
      createdAt: now,
    });

    return {
      sampleCount: nextSampleCount,
      cloneStatus: nextStatus,
    };
  },
});

export const setDefaultVoiceProfile = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    voiceProfileId: v.id("voiceProfiles"),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    const voiceProfile = await getVoiceProfileOrThrow(
      ctx,
      viewerContext.organization._id,
      args.voiceProfileId,
    );
    const now = Date.now();

    const voiceProfiles = await ctx.db
      .query("voiceProfiles")
      .withIndex("by_organization_and_updated_at", (q) =>
        q.eq("organizationId", viewerContext.organization._id),
      )
      .collect();

    await Promise.all(
      voiceProfiles.map((item) =>
        ctx.db.patch(item._id, {
          defaultForCalls: item._id === voiceProfile._id,
          updatedAt: item._id === voiceProfile._id ? now : item.updatedAt,
        }),
      ),
    );

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_profile_set_default",
      targetType: "voice_profile",
      targetId: voiceProfile._id,
      summary: `Set ${voiceProfile.name} as the default calling voice.`,
      createdAt: now,
    });

    return { voiceProfileId: voiceProfile._id };
  },
});

export const requestCloneTraining = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    voiceProfileId: v.id("voiceProfiles"),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    const voiceProfile = await getVoiceProfileOrThrow(
      ctx,
      viewerContext.organization._id,
      args.voiceProfileId,
    );

    if (voiceProfile.sampleCount === 0) {
      throw new Error("Upload at least one reference sample before requesting clone training.");
    }

    const now = Date.now();

    await ctx.db.patch(voiceProfile._id, {
      cloneStatus: "training_requested",
      cloneJobRequestedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_clone_requested",
      targetType: "voice_profile",
      targetId: voiceProfile._id,
      summary: `Queued clone training request for ${voiceProfile.name}.`,
      metadata: {
        sampleCount: voiceProfile.sampleCount,
      },
      createdAt: now,
    });

    return { status: "training_requested" as const };
  },
});
