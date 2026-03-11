import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  DEFAULT_ORGANIZATION_SLUG,
  DEFAULT_VIEWER_EMAIL,
  getOrganizationBySlug,
} from "./lib/auth";

export const ensureDemoWorkspace = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    ownerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizationSlug = args.organizationSlug ?? DEFAULT_ORGANIZATION_SLUG;
    const ownerEmail = args.ownerEmail ?? DEFAULT_VIEWER_EMAIL;
    const ownerName = args.ownerName ?? "Rahul Kumar";
    let createdRecords = 0;

    let organization = await getOrganizationBySlug(ctx.db, organizationSlug);

    if (!organization) {
      const organizationId = await ctx.db.insert("organizations", {
        name: "cloler.ai Demo Workspace",
        slug: organizationSlug,
        status: "active",
        plan: "growth",
        billingEmail: ownerEmail,
        defaultVoiceTier: "bulbul_v2",
        telephonyMode: "hybrid",
        createdAt: now,
        updatedAt: now,
      });
      createdRecords += 1;
      organization = await ctx.db.get(organizationId);
    } else {
      await ctx.db.patch(organization._id, {
        name: "cloler.ai Demo Workspace",
        status: "active",
        plan: "growth",
        billingEmail: ownerEmail,
        defaultVoiceTier: "bulbul_v2",
        telephonyMode: "hybrid",
        updatedAt: now,
      });
      organization = {
        ...organization,
        name: "cloler.ai Demo Workspace",
        status: "active",
        plan: "growth",
        billingEmail: ownerEmail,
        defaultVoiceTier: "bulbul_v2",
        telephonyMode: "hybrid",
        updatedAt: now,
      };
    }

    if (!organization) {
      throw new Error("Failed to create or load the demo organization.");
    }

    const owner = await ctx.db
      .query("users")
      .withIndex("by_organization_and_email", (q) =>
        q.eq("organizationId", organization._id).eq("email", ownerEmail),
      )
      .unique();

    if (!owner) {
      await ctx.db.insert("users", {
        organizationId: organization._id,
        email: ownerEmail,
        name: ownerName,
        role: "owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      createdRecords += 1;
    }

    const operatorEmail = "ops@cloler.ai";
    const operator = await ctx.db
      .query("users")
      .withIndex("by_organization_and_email", (q) =>
        q.eq("organizationId", organization._id).eq("email", operatorEmail),
      )
      .unique();

    if (!operator) {
      await ctx.db.insert("users", {
        organizationId: organization._id,
        email: operatorEmail,
        name: "Operator Desk",
        role: "operator",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      createdRecords += 1;
    }

    const existingUsage = await ctx.db
      .query("usageEvents")
      .withIndex("by_organization_and_happened_at", (q) =>
        q.eq("organizationId", organization._id),
      )
      .take(1);

    if (existingUsage.length === 0) {
      const usageSeed = [
        {
          eventType: "telephony" as const,
          metricKey: "call_minutes",
          quantity: 34,
          unitCostInr: 2,
          totalCostInr: 68,
          source: "telephony_service" as const,
          happenedAt: now - 1000 * 60 * 110,
          metadata: {
            providerStack: ["LiveKit", "Vobiz", "Sarvam", "Groq"],
            targetCostPerMinuteInr: 2,
          },
        },
        {
          eventType: "campaign" as const,
          metricKey: "approved_bulk_rows",
          quantity: 172,
          unitCostInr: 0,
          totalCostInr: 0,
          source: "importer" as const,
          happenedAt: now - 1000 * 60 * 85,
          metadata: {
            uploadType: "xlsx",
            blockedDndRows: 13,
          },
        },
        {
          eventType: "compliance" as const,
          metricKey: "dnd_blocked_rows",
          quantity: 13,
          unitCostInr: 0,
          totalCostInr: 0,
          source: "system" as const,
          happenedAt: now - 1000 * 60 * 82,
          metadata: {
            reason: "suppression_and_dnd_filter",
          },
        },
        {
          eventType: "voice" as const,
          metricKey: "premium_voice_preview_minutes",
          quantity: 4,
          unitCostInr: 1.25,
          totalCostInr: 5,
          source: "dashboard" as const,
          happenedAt: now - 1000 * 60 * 47,
          metadata: {
            defaultTier: "bulbul_v2",
            premiumTier: "bulbul_v3",
          },
        },
      ];

      for (const event of usageSeed) {
        await ctx.db.insert("usageEvents", {
          organizationId: organization._id,
          ...event,
        });
        createdRecords += 1;
      }
    }

    const existingAudit = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization_and_created_at", (q) =>
        q.eq("organizationId", organization._id),
      )
      .take(1);

    if (existingAudit.length === 0) {
      const auditSeed = [
        {
          actorType: "system" as const,
          actorId: "seed:system",
          action: "workspace_seeded",
          targetType: "organization",
          targetId: organization._id,
          summary: "Initialized the Convex demo workspace for cloler.ai.",
          metadata: {
            step: "step-03-convex-foundation",
          },
          createdAt: now - 1000 * 60 * 125,
        },
        {
          actorType: "service" as const,
          actorId: "telephony-agent",
          action: "telephony_sync_boundary_documented",
          targetType: "integration",
          targetId: "livekit-vobiz-sarvam",
          summary:
            "Marked telephony runtime as external and Convex as the control-plane store.",
          metadata: {
            transport: "sip",
          },
          createdAt: now - 1000 * 60 * 90,
        },
        {
          actorType: "system" as const,
          actorId: "bulk-importer",
          action: "dnd_rows_rejected",
          targetType: "campaign_upload",
          targetId: "seed-upload-001",
          summary:
            "Rejected 13 DND rows and regenerated the approved outbound sheet.",
          metadata: {
            blockedRows: 13,
            approvedRows: 172,
          },
          createdAt: now - 1000 * 60 * 78,
        },
        {
          actorType: "user" as const,
          actorId: ownerEmail,
          action: "dashboard_reviewed",
          targetType: "workspace",
          targetId: organization._id,
          summary:
            "Reviewed projected telephony run rate and operator ownership model.",
          metadata: {
            voiceTier: "bulbul_v2",
          },
          createdAt: now - 1000 * 60 * 40,
        },
      ];

      for (const entry of auditSeed) {
        await ctx.db.insert("auditLogs", {
          organizationId: organization._id,
          ...entry,
        });
        createdRecords += 1;
      }
    }

    return {
      organizationId: organization._id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      createdRecords,
    };
  },
});
