import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { findAuthenticatedViewerContext } from "./lib/auth";
import { createConvexLogger } from "./lib/logger";
import { v } from "convex/values";

const logger = createConvexLogger("voices");
const MINIMUM_REFERENCE_SAMPLES = 3;
const CLONE_PREP_DELAY_MS = 800;
const CLONE_TRAIN_DELAY_MS = 1800;
const PREVIEW_PROCESS_DELAY_MS = 900;

function slugifyVoiceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function formatLanguageForSpeech(language: Doc<"voiceProfiles">["language"]) {
  if (language === "hinglish") {
    return "en-IN";
  }

  return language;
}

function getGenerationProvider(voiceProfile: Doc<"voiceProfiles">) {
  if (voiceProfile.mode === "stock") {
    return voiceProfile.stockVoiceKey === "bulbul_v2"
      ? ("sarvam_bulbul_v2" as const)
      : ("sarvam_bulbul_v3" as const);
  }

  return "custom_preview" as const;
}

function getVoiceUsageUnitCost(provider: Doc<"voiceGenerations">["provider"]) {
  switch (provider) {
    case "sarvam_bulbul_v2":
      return 0.0015;
    case "sarvam_bulbul_v3":
      return 0.002;
    case "custom_preview":
    default:
      return 0.0035;
  }
}

function estimateGeneratedSeconds(characterCount: number) {
  return Math.max(4, Math.ceil(characterCount / 11));
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

async function listVoiceCloneJobsForProfile(
  ctx: QueryCtx | MutationCtx,
  voiceProfileId: Doc<"voiceProfiles">["_id"],
) {
  return ctx.db
    .query("voiceCloneJobs")
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
        const [samples, generations, cloneJobs] = await Promise.all([
          listVoiceSamplesForProfile(ctx, voiceProfile._id),
          listVoiceGenerationsForProfile(ctx, voiceProfile._id),
          listVoiceCloneJobsForProfile(ctx, voiceProfile._id),
        ]);

        const sortedSamples = [...samples].sort(
          (left, right) => right.createdAt - left.createdAt,
        );
        const sortedGenerations = [...generations].sort(
          (left, right) => right.createdAt - left.createdAt,
        );
        const sortedCloneJobs = [...cloneJobs].sort(
          (left, right) => right.requestedAt - left.requestedAt,
        );

        const latestSamples = await Promise.all(
          sortedSamples.slice(0, 3).map(async (sample) => ({
            id: sample._id,
            fileName: sample.fileName,
            sizeBytes: sample.sizeBytes,
            contentType: sample.contentType,
            uploadStatus: sample.uploadStatus,
            createdAt: sample.createdAt,
            url: await ctx.storage.getUrl(sample.storageId),
          })),
        );

        const recentGenerations = sortedGenerations.slice(0, 4).map((generation) => ({
          id: generation._id,
          status: generation.status,
          provider: generation.provider,
          text: generation.text,
          characterCount: generation.characterCount,
          createdAt: generation.createdAt,
          completedAt: generation.completedAt,
          failureReason: generation.failureReason,
          playbackMode: generation.playbackMode ?? "browser_tts",
          generatedSeconds: generation.generatedSeconds,
          canPlay: generation.status === "ready",
        }));

        const latestCloneJob = sortedCloneJobs[0]
          ? {
              id: sortedCloneJobs[0]._id,
              status: sortedCloneJobs[0].status,
              provider: sortedCloneJobs[0].provider,
              sampleCount: sortedCloneJobs[0].sampleCount,
              requestedAt: sortedCloneJobs[0].requestedAt,
              startedAt: sortedCloneJobs[0].startedAt,
              completedAt: sortedCloneJobs[0].completedAt,
              failureReason: sortedCloneJobs[0].failureReason,
            }
          : null;

        return {
          id: voiceProfile._id,
          name: voiceProfile.name,
          slug: voiceProfile.slug,
          description: voiceProfile.description ?? "",
          language: voiceProfile.language,
          speechLanguage: formatLanguageForSpeech(voiceProfile.language),
          mode: voiceProfile.mode,
          cloneStatus: voiceProfile.cloneStatus,
          sampleCount: samples.length,
          generationCount: generations.length,
          previewCount: generations.filter((generation) => generation.status === "ready")
            .length,
          defaultForCalls: voiceProfile.defaultForCalls,
          providerVoiceId: voiceProfile.providerVoiceId,
          lastPreviewGeneratedAt: voiceProfile.lastPreviewGeneratedAt,
          updatedAt: voiceProfile.updatedAt,
          latestSamples,
          recentGenerations,
          latestCloneJob,
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
    const nextStatus =
      nextSampleCount >= MINIMUM_REFERENCE_SAMPLES
        ? "ready_for_training"
        : "samples_pending";

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

    if (voiceProfile.sampleCount < MINIMUM_REFERENCE_SAMPLES) {
      throw new Error(
        `Upload at least ${MINIMUM_REFERENCE_SAMPLES} reference samples before starting clone training.`,
      );
    }

    const existingCloneJobs = await listVoiceCloneJobsForProfile(ctx, voiceProfile._id);
    const hasPendingCloneJob = existingCloneJobs.some((job) =>
      ["queued", "preparing_samples", "training"].includes(job.status),
    );

    if (hasPendingCloneJob) {
      throw new Error("Clone training is already in progress for this voice.");
    }

    const now = Date.now();
    const cloneJobId = await ctx.db.insert("voiceCloneJobs", {
      organizationId: viewerContext.organization._id,
      voiceProfileId: voiceProfile._id,
      requestedByUserId: viewerContext.actor.userId,
      provider: "resonance_pipeline",
      status: "queued",
      sampleCount: voiceProfile.sampleCount,
      requestedAt: now,
    });

    await ctx.db.patch(voiceProfile._id, {
      cloneStatus: "training_requested",
      cloneJobRequestedAt: now,
      lastCloneError: undefined,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_clone_requested",
      targetType: "voice_profile",
      targetId: voiceProfile._id,
      summary: `Queued clone training for ${voiceProfile.name}.`,
      metadata: {
        sampleCount: voiceProfile.sampleCount,
        cloneJobId,
      },
      createdAt: now,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.voices.beginCloneTrainingLifecycle,
      { cloneJobId },
    );

    return { status: "training_requested" as const, cloneJobId };
  },
});

export const requestVoicePreviewGeneration = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    voiceProfileId: v.id("voiceProfiles"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const viewerContext = await requireViewerContext(ctx, args.organizationSlug);
    const voiceProfile = await getVoiceProfileOrThrow(
      ctx,
      viewerContext.organization._id,
      args.voiceProfileId,
    );
    const text = args.text.trim();

    if (text.length < 12) {
      throw new Error("Preview text must be at least 12 characters.");
    }

    if (voiceProfile.mode === "custom" && voiceProfile.cloneStatus !== "ready") {
      throw new Error("Finish clone training before generating a preview.");
    }

    const now = Date.now();
    const provider = getGenerationProvider(voiceProfile);
    const generationId = await ctx.db.insert("voiceGenerations", {
      organizationId: viewerContext.organization._id,
      voiceProfileId: voiceProfile._id,
      requestedByUserId: viewerContext.actor.userId,
      status: "queued",
      provider,
      text,
      characterCount: text.length,
      createdAt: now,
    });

    await ctx.db.patch(voiceProfile._id, {
      generationCount: voiceProfile.generationCount + 1,
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      organizationId: viewerContext.organization._id,
      actorType: "user",
      actorId: viewerContext.actor.clerkUserId,
      action: "voice_preview_requested",
      targetType: "voice_generation",
      targetId: generationId,
      summary: `Queued preview generation for ${voiceProfile.name}.`,
      metadata: {
        provider,
        characterCount: text.length,
      },
      createdAt: now,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.voices.beginVoicePreviewGeneration,
      { generationId },
    );

    return { generationId, status: "queued" as const };
  },
});

export const beginCloneTrainingLifecycle = internalMutation({
  args: {
    cloneJobId: v.id("voiceCloneJobs"),
  },
  handler: async (ctx, args) => {
    const cloneJob = await ctx.db.get(args.cloneJobId);

    if (!cloneJob || cloneJob.status !== "queued") {
      return;
    }

    const voiceProfile = await ctx.db.get(cloneJob.voiceProfileId);
    const now = Date.now();

    await ctx.db.patch(cloneJob._id, {
      status: "preparing_samples",
      startedAt: now,
    });

    if (voiceProfile) {
      await ctx.db.patch(voiceProfile._id, {
        cloneStatus: "training_requested",
        updatedAt: now,
      });
    }

    await ctx.scheduler.runAfter(
      CLONE_PREP_DELAY_MS,
      internal.voices.advanceCloneTrainingLifecycle,
      { cloneJobId: cloneJob._id },
    );
  },
});

export const advanceCloneTrainingLifecycle = internalMutation({
  args: {
    cloneJobId: v.id("voiceCloneJobs"),
  },
  handler: async (ctx, args) => {
    const cloneJob = await ctx.db.get(args.cloneJobId);

    if (!cloneJob || cloneJob.status !== "preparing_samples") {
      return;
    }

    const voiceProfile = await ctx.db.get(cloneJob.voiceProfileId);
    const now = Date.now();

    await ctx.db.patch(cloneJob._id, {
      status: "training",
    });

    if (voiceProfile) {
      await ctx.db.patch(voiceProfile._id, {
        cloneStatus: "training",
        updatedAt: now,
      });
    }

    await ctx.scheduler.runAfter(
      CLONE_TRAIN_DELAY_MS,
      internal.voices.completeCloneTrainingLifecycle,
      { cloneJobId: cloneJob._id },
    );
  },
});

export const completeCloneTrainingLifecycle = internalMutation({
  args: {
    cloneJobId: v.id("voiceCloneJobs"),
  },
  handler: async (ctx, args) => {
    const cloneJob = await ctx.db.get(args.cloneJobId);

    if (!cloneJob || cloneJob.status !== "training") {
      return;
    }

    const voiceProfile = await ctx.db.get(cloneJob.voiceProfileId);
    const now = Date.now();

    await ctx.db.patch(cloneJob._id, {
      status: "ready",
      completedAt: now,
    });

    if (voiceProfile) {
      await ctx.db.patch(voiceProfile._id, {
        cloneStatus: "ready",
        providerVoiceId:
          voiceProfile.providerVoiceId ??
          `clone_${String(voiceProfile._id)}_${String(now).slice(-6)}`,
        lastCloneJobAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("auditLogs", {
        organizationId: voiceProfile.organizationId,
        actorType: "system",
        actorId: "clone_pipeline",
        action: "voice_clone_completed",
        targetType: "voice_profile",
        targetId: voiceProfile._id,
        summary: `Clone training completed for ${voiceProfile.name}.`,
        metadata: {
          cloneJobId: cloneJob._id,
          provider: cloneJob.provider,
        },
        createdAt: now,
      });
    }
  },
});

export const beginVoicePreviewGeneration = internalMutation({
  args: {
    generationId: v.id("voiceGenerations"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db.get(args.generationId);

    if (!generation || generation.status !== "queued") {
      return;
    }

    await ctx.db.patch(generation._id, {
      status: "processing",
    });

    await ctx.scheduler.runAfter(
      PREVIEW_PROCESS_DELAY_MS,
      internal.voices.completeVoicePreviewGeneration,
      { generationId: generation._id },
    );
  },
});

export const completeVoicePreviewGeneration = internalMutation({
  args: {
    generationId: v.id("voiceGenerations"),
  },
  handler: async (ctx, args) => {
    const generation = await ctx.db.get(args.generationId);

    if (!generation || generation.status !== "processing") {
      return;
    }

    const voiceProfile = await ctx.db.get(generation.voiceProfileId);
    const now = Date.now();
    const generatedSeconds = estimateGeneratedSeconds(generation.characterCount);
    const unitCostInr = getVoiceUsageUnitCost(generation.provider);
    const totalCostInr = Number(
      (generation.characterCount * unitCostInr).toFixed(2),
    );

    await ctx.db.patch(generation._id, {
      status: "ready",
      playbackMode: "browser_tts",
      generatedSeconds,
      completedAt: now,
    });

    await ctx.db.insert("usageEvents", {
      organizationId: generation.organizationId,
      eventType: "voice",
      metricKey: "preview_characters_generated",
      quantity: generation.characterCount,
      unitCostInr,
      totalCostInr,
      source: "dashboard",
      happenedAt: now,
      metadata: {
        voiceProfileId: generation.voiceProfileId,
        provider: generation.provider,
        generationId: generation._id,
        generatedSeconds,
      },
    });

    if (voiceProfile) {
      await ctx.db.patch(voiceProfile._id, {
        lastPreviewGeneratedAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("auditLogs", {
        organizationId: generation.organizationId,
        actorType: "system",
        actorId: "preview_pipeline",
        action: "voice_preview_ready",
        targetType: "voice_generation",
        targetId: generation._id,
        summary: `Preview generated for ${voiceProfile.name}.`,
        metadata: {
          provider: generation.provider,
          characterCount: generation.characterCount,
          generatedSeconds,
        },
        createdAt: now,
      });
    }

    logger.info("voice_preview_ready", {
      organizationId: generation.organizationId,
      voiceProfileId: generation.voiceProfileId,
      generationId: generation._id,
      provider: generation.provider,
    });
  },
});
