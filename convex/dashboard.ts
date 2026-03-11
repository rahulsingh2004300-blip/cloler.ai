import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  findAuthenticatedViewerContext,
  getOrganizationByClerkId,
  getOrganizationBySlug,
  resolveIdentityOrganization,
} from "./lib/auth";
import {
  listOrganizationMembers,
  listRecentAuditLogs,
  listRecentUsageEvents,
} from "./lib/organizationQueries";
import { TELEPHONY_SYNC_BOUNDARIES } from "./lib/syncBoundaries";

function normalizeSlug(value?: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

function normalizeName(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeEmail(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

function fallbackSlugFromUser(clerkUserId: string) {
  const suffix = clerkUserId.slice(-6).toLowerCase();
  return `org-${suffix}`;
}

export const getWorkspaceOverview = query({
  args: {
    organizationSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        status: "unauthorized" as const,
        syncBoundaries: TELEPHONY_SYNC_BOUNDARIES,
      };
    }

    const viewerContext = await findAuthenticatedViewerContext(ctx.db, identity, {
      organizationSlug: args.organizationSlug,
    });

    if (!viewerContext) {
      const { organizationSlug } = resolveIdentityOrganization(identity);

      return {
        status: "needs_onboarding" as const,
        organizationSlug: organizationSlug ?? null,
        syncBoundaries: TELEPHONY_SYNC_BOUNDARIES,
      };
    }

    const [members, usageEvents, auditFeed] = await Promise.all([
      listOrganizationMembers(ctx.db, viewerContext.organization._id),
      listRecentUsageEvents(ctx.db, viewerContext.organization._id),
      listRecentAuditLogs(ctx.db, viewerContext.organization._id),
    ]);

    const callUsageEvents = usageEvents.filter(
      (event) => event.metricKey === "call_minutes",
    );
    const callMinutes = callUsageEvents.reduce(
      (total, event) => total + event.quantity,
      0,
    );
    const telephonySpendInr = callUsageEvents.reduce(
      (total, event) => total + event.totalCostInr,
      0,
    );
    const totalSpendInr = usageEvents.reduce(
      (total, event) => total + event.totalCostInr,
      0,
    );
    const averageCostPerMinuteInr =
      callMinutes === 0
        ? 0
        : Number((telephonySpendInr / callMinutes).toFixed(2));

    return {
      status: "ready" as const,
      organization: {
        id: viewerContext.organization._id,
        name: viewerContext.organization.name,
        slug: viewerContext.organization.slug,
        status: viewerContext.organization.status,
        plan: viewerContext.organization.plan,
        defaultVoiceTier: viewerContext.organization.defaultVoiceTier,
        telephonyMode: viewerContext.organization.telephonyMode,
        billingEmail:
          viewerContext.organization.billingEmail ?? viewerContext.actor.email,
        updatedAt: viewerContext.organization.updatedAt,
      },
      viewer: viewerContext.actor,
      counts: {
        members: members.length,
        usageEvents: usageEvents.length,
        auditLogs: auditFeed.length,
      },
      usageSummary: {
        callMinutes,
        telephonySpendInr,
        totalSpendInr,
        averageCostPerMinuteInr,
        projectedMonthlyTelephonyInr: Number(
          (averageCostPerMinuteInr * 600).toFixed(2),
        ),
      },
      recentUsageEvents: usageEvents.slice(0, 5).map((event) => ({
        id: event._id,
        eventType: event.eventType,
        metricKey: event.metricKey,
        quantity: event.quantity,
        totalCostInr: event.totalCostInr,
        source: event.source,
        happenedAt: event.happenedAt,
      })),
      auditFeed: auditFeed.map((entry) => ({
        id: entry._id,
        action: entry.action,
        summary: entry.summary,
        createdAt: entry.createdAt,
      })),
      syncBoundaries: TELEPHONY_SYNC_BOUNDARIES,
    };
  },
});

export const ensureWorkspaceForViewer = mutation({
  args: {
    organizationSlug: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    viewerEmail: v.optional(v.string()),
    viewerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Authentication required.");
    }

    const now = Date.now();
    const clerkUserId = identity.subject;
    const fallbackEmail = normalizeEmail(args.viewerEmail);

    if (!clerkUserId) {
      throw new Error("Authenticated user id is missing.");
    }
    const viewerEmail =
      normalizeEmail(identity.email) ?? fallbackEmail ?? `${clerkUserId}@clerk.local`;

    const viewerName =
      normalizeName(identity.name) ??
      normalizeName(args.viewerName) ??
      viewerEmail.split("@")[0] ??
      "Operator";

    const {
      clerkOrganizationId,
      organizationSlug: organizationSlugFromIdentity,
    } = resolveIdentityOrganization(identity);

    const requestedSlug =
      normalizeSlug(args.organizationSlug) ?? organizationSlugFromIdentity;

    if (!clerkOrganizationId && !requestedSlug) {
      throw new Error("Active organization is required.");
    }

    let organization = clerkOrganizationId
      ? await getOrganizationByClerkId(ctx.db, clerkOrganizationId)
      : null;

    if (!organization && requestedSlug) {
      organization = await getOrganizationBySlug(ctx.db, requestedSlug);
    }

    const safeSlug = requestedSlug ?? fallbackSlugFromUser(clerkUserId);
    const safeName =
      normalizeName(args.organizationName) ?? "cloler.ai Workspace";

    if (!organization) {
      const organizationId = await ctx.db.insert("organizations", {
        name: safeName,
        slug: safeSlug,
        clerkOrganizationId,
        status: "active",
        plan: "starter",
        billingEmail: viewerEmail,
        defaultVoiceTier: "bulbul_v2",
        telephonyMode: "hybrid",
        createdAt: now,
        updatedAt: now,
      });

      organization = await ctx.db.get(organizationId);
    } else {
      await ctx.db.patch(organization._id, {
        clerkOrganizationId:
          organization.clerkOrganizationId ?? clerkOrganizationId,
        name: organization.name || safeName,
        billingEmail: organization.billingEmail ?? viewerEmail,
        updatedAt: now,
      });

      organization = {
        ...organization,
        clerkOrganizationId: organization.clerkOrganizationId ?? clerkOrganizationId,
        name: organization.name || safeName,
        billingEmail: organization.billingEmail ?? viewerEmail,
        updatedAt: now,
      };
    }

    if (!organization) {
      throw new Error("Failed to initialize organization workspace.");
    }

    const existingByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (
      existingByClerkId &&
      existingByClerkId.organizationId !== organization._id
    ) {
      throw new Error(
        "This user is linked to a different organization in Convex.",
      );
    }

    if (!existingByClerkId) {
      await ctx.db.insert("users", {
        organizationId: organization._id,
        clerkUserId,
        email: viewerEmail,
        name: viewerName,
        role: "owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingByClerkId._id, {
        email: viewerEmail,
        name: viewerName,
        status: "active",
        updatedAt: now,
      });
    }

    const usageExists = await ctx.db
      .query("usageEvents")
      .withIndex("by_organization_and_happened_at", (q) =>
        q.eq("organizationId", organization._id),
      )
      .take(1);

    if (usageExists.length === 0) {
      await ctx.db.insert("usageEvents", {
        organizationId: organization._id,
        eventType: "telephony",
        metricKey: "call_minutes",
        quantity: 0,
        unitCostInr: 2,
        totalCostInr: 0,
        source: "system",
        happenedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      organizationId: organization._id,
      actorType: "user",
      actorId: clerkUserId,
      action: "workspace_initialized",
      targetType: "organization",
      targetId: organization._id,
      summary: "Initialized organization workspace from Clerk-authenticated session.",
      metadata: {
        organizationSlug: organization.slug,
      },
      createdAt: now,
    });

    return {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      viewerEmail,
      viewerName,
    };
  },
});
