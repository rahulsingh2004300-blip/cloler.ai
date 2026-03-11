import { v } from "convex/values";
import { query } from "./_generated/server";
import {
  DEFAULT_ORGANIZATION_SLUG,
  DEFAULT_VIEWER_EMAIL,
  findViewerContext,
} from "./lib/auth";
import { TELEPHONY_SYNC_BOUNDARIES } from "./lib/syncBoundaries";

export const getWorkspaceOverview = query({
  args: {
    organizationSlug: v.optional(v.string()),
    viewerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const organizationSlug = args.organizationSlug ?? DEFAULT_ORGANIZATION_SLUG;
    const viewerEmail = args.viewerEmail ?? DEFAULT_VIEWER_EMAIL;
    const viewerContext = await findViewerContext(ctx.db, {
      organizationSlug,
      viewerEmail,
    });

    if (!viewerContext) {
      return {
        status: "needs_seed" as const,
        organizationSlug,
        viewerEmail,
        syncBoundaries: TELEPHONY_SYNC_BOUNDARIES,
      };
    }

    const members = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", viewerContext.organization._id),
      )
      .collect();

    const usageEvents = await ctx.db
      .query("usageEvents")
      .withIndex("by_organization_and_happened_at", (q) =>
        q.eq("organizationId", viewerContext.organization._id),
      )
      .order("desc")
      .take(12);

    const auditFeed = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization_and_created_at", (q) =>
        q.eq("organizationId", viewerContext.organization._id),
      )
      .order("desc")
      .take(6);

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
