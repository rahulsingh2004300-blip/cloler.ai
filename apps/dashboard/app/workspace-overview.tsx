"use client";

import {
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
} from "@cloler/ui";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { startTransition, useState } from "react";

const workspaceArgs = {
  organizationSlug: "cloler-demo",
  viewerEmail: "owner@cloler.ai",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function WorkspaceOverview() {
  const overview = useQuery(api.dashboard.getWorkspaceOverview, workspaceArgs);
  const ensureDemoWorkspace = useMutation(api.seed.ensureDemoWorkspace);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshWorkspace = () => {
    startTransition(() => {
      setIsRefreshing(true);
      setFeedback("Refreshing the seeded workspace in Convex...");
    });

    void ensureDemoWorkspace({
      ...workspaceArgs,
      ownerName: "Rahul Kumar",
    })
      .then((result) => {
        startTransition(() => {
          setFeedback(
            `Workspace ready: ${result.organizationName} (${result.createdRecords} new records synced).`,
          );
        });
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Convex workspace refresh failed.";

        startTransition(() => {
          setFeedback(message);
        });
      })
      .finally(() => {
        startTransition(() => {
          setIsRefreshing(false);
        });
      });
  };

  if (overview === undefined) {
    return (
      <StudioShell
        eyebrow="cloler.ai / dashboard"
        title="Connecting the operator cockpit to Convex live data."
        description="This workspace is waiting for the first live snapshot from Convex. Once the query resolves, we will show tenant metrics, audit flow, and telephony sync boundaries here."
        pills={["Convex", "Live dashboard", "Tenant-safe"]}
        actions={[
          {
            href: "#workspace-status",
            label: "Open workspace status",
            caption:
              "The dashboard will swap from placeholder UI to live query results.",
          },
          {
            href: "#sync-boundaries",
            label: "Review sync boundaries",
            caption:
              "Convex stays the control plane while telephony runtime stays external.",
            variant: "secondary",
          },
        ]}
        metrics={[
          {
            label: "Convex",
            value: "Connecting",
            note: "Bootstrapping the first live subscription.",
            emphasis: true,
          },
          {
            label: "Usage events",
            value: "...",
            note: "Waiting for seeded records.",
          },
          {
            label: "Audit logs",
            value: "...",
            note: "Loading the control-plane trail.",
          },
        ]}
        spotlight={
          <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
            <SectionHeading
              eyebrow="Convex status"
              title="Waiting for the first backend response"
              description="The Step 03 foundation keeps the UI stable even before seed data exists."
            />
          </div>
        }
      >
        <FeatureCard
          title="Schema first"
          description="Organizations, users, usage events, and audit logs are now the first durable control-plane tables for cloler.ai."
          detail="Control plane"
          tone="accent"
        />
        <FeatureCard
          title="Telephony boundary"
          description="LiveKit, Vobiz, and Sarvam runtime state stay out of the dashboard database until they become durable business events."
          detail="Service contract"
        />
        <FeatureCard
          title="Frontend wiring"
          description="This page is already subscribed through Convex React, so the seeded workspace appears without a page refresh."
          detail="Live query"
          tone="warm"
        />
      </StudioShell>
    );
  }

  const isReady = overview.status === "ready";

  const metrics = isReady
    ? [
        {
          label: "Call minutes",
          value: `${overview.usageSummary.callMinutes} min`,
          note: `Average live cost ${formatCurrency(overview.usageSummary.averageCostPerMinuteInr)} per minute.`,
          emphasis: true,
        },
        {
          label: "Projected telephony",
          value: formatCurrency(
            overview.usageSummary.projectedMonthlyTelephonyInr,
          ),
          note: "Projection uses the seeded low-cost Bulbul v2 call path.",
        },
        {
          label: "Workspace members",
          value: `${overview.counts.members}`,
          note: `${overview.counts.auditLogs} audit entries currently visible.`,
        },
      ]
    : [
        {
          label: "Workspace",
          value: "Not seeded",
          note: "Create the first tenant-safe records in Convex.",
          emphasis: true,
        },
        {
          label: "Call minutes",
          value: "0",
          note: "No usage events have been written yet.",
        },
        {
          label: "Audit logs",
          value: "0",
          note: "Seed the workspace to create the initial trail.",
        },
      ];

  const spotlight = isReady ? (
    <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
      <SectionHeading
        eyebrow="Workspace status"
        title={`${overview.organization.name} is live in Convex`}
        description={`Plan ${overview.organization.plan} with ${overview.organization.defaultVoiceTier} as the default voice tier. Last sync ${formatDateTime(overview.organization.updatedAt)}.`}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Telephony mode"
          value={overview.organization.telephonyMode}
          note="This stays tenant-facing while provider credentials remain platform-owned."
        />
        <MetricCard
          label="Total visible spend"
          value={formatCurrency(overview.usageSummary.totalSpendInr)}
          note={`Billing contact ${overview.organization.billingEmail}.`}
          emphasis
        />
      </div>
      <div className="mt-6 rounded-[1.6rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Seed controls
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Re-run the Step 03 mutation any time to restore the demo
              control-plane data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefreshWorkspace}
            disabled={isRefreshing}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Re-seed demo workspace"}
          </button>
        </div>
        {feedback ? (
          <p className="mt-4 text-sm text-slate-500">{feedback}</p>
        ) : null}
      </div>
    </div>
  ) : (
    <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
      <SectionHeading
        eyebrow="Workspace bootstrap"
        title="The Convex project is ready, but this tenant has no records yet"
        description="Use the seed mutation from the frontend to create the first organization, users, usage events, and audit logs."
      />
      <button
        type="button"
        onClick={handleRefreshWorkspace}
        disabled={isRefreshing}
        className="mt-6 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRefreshing ? "Initializing..." : "Initialize Convex workspace"}
      </button>
      {feedback ? (
        <p className="mt-4 text-sm text-slate-500">{feedback}</p>
      ) : null}
    </div>
  );

  return (
    <StudioShell
      eyebrow="cloler.ai / dashboard"
      title="A live Convex-backed control plane for telephony, voice, and billing decisions."
      description="Step 03 turns the dashboard into a real backend surface: seeded tenant records, audit trails, low-cost telephony tracking, and an explicit contract with the future Python call worker."
      pills={["Convex live", "Provider-owned infra", "DND-safe workflows"]}
      actions={[
        {
          href: "#workspace-status",
          label: "Open workspace status",
          caption:
            "Review live metrics, billing visibility, and the current seed state.",
        },
        {
          href: "#sync-boundaries",
          label: "Inspect sync contract",
          caption:
            "See what Convex owns versus what stays inside the telephony runtime.",
          variant: "secondary",
        },
      ]}
      metrics={metrics}
      spotlight={spotlight}
      footnote={
        isReady ? (
          <p>
            Viewer {overview.viewer.name} is reading tenant-safe dashboard data
            while provider secrets remain outside customer configuration
            surfaces.
          </p>
        ) : (
          <p>
            Convex is connected successfully. The next mutation creates the
            first tenant records and immediately hydrates this UI.
          </p>
        )
      }
    >
      <FeatureCard
        title="Usage and cost foundation"
        description={
          isReady
            ? `Current seeded telephony spend is ${formatCurrency(overview.usageSummary.telephonySpendInr)} for ${overview.usageSummary.callMinutes} minutes, which keeps the default path close to the target low-cost stack.`
            : "Seed data will create the first telephony usage snapshot so we can validate the cost model directly inside the product."
        }
        detail="Finance visibility"
        tone="accent"
      />
      <FeatureCard
        title="Recent operator trail"
        description={
          isReady
            ? overview.auditFeed
                .slice(0, 2)
                .map(
                  (entry) =>
                    `${entry.action.replaceAll("_", " ")} on ${formatDateTime(entry.createdAt)}`,
                )
                .join(". ")
            : "Audit logs appear here as soon as the demo workspace is seeded."
        }
        detail="Audit visibility"
      />
      <FeatureCard
        title="Telephony sync boundary"
        description={`Convex owns ${overview.syncBoundaries.convexOwned[0]}. The worker owns ${overview.syncBoundaries.telephonyOwned[0]}.`}
        detail="Integration contract"
        tone="warm"
      />

      {isReady ? (
        <div
          id="workspace-status"
          className="md:col-span-2 rounded-[1.8rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-6"
        >
          <SectionHeading
            eyebrow="Recent usage"
            title="Live records from Convex"
            description="These rows come from the seeded usage events table and will later be fed by the Python telephony service."
          />
          <div className="mt-6 space-y-3">
            {overview.recentUsageEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 rounded-[1.3rem] border border-[color:var(--cl-color-line)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.metricKey.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.eventType} via {event.source} on{" "}
                    {formatDateTime(event.happenedAt)}
                  </p>
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p>{event.quantity} units</p>
                  <p>{formatCurrency(event.totalCostInr)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          id="workspace-status"
          className="md:col-span-2 rounded-[1.8rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-6"
        >
          <SectionHeading
            eyebrow="Seed preview"
            title="What the first mutation will create"
            description="One organization, two users, usage events for telephony and DND-safe imports, plus an initial audit trail."
          />
        </div>
      )}

      <div
        id="sync-boundaries"
        className="rounded-[1.8rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-6"
      >
        <SectionHeading
          eyebrow="Sync boundaries"
          title="Convex and the telephony worker have separate responsibilities"
          description="This contract keeps the SaaS backend durable and queryable without turning it into a real-time media runtime."
        />
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">
              Convex owns
            </p>
            <p className="mt-2">
              {overview.syncBoundaries.convexOwned.join(". ")}.
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">
              Telephony worker owns
            </p>
            <p className="mt-2">
              {overview.syncBoundaries.telephonyOwned.join(". ")}.
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sync into Convex
            </p>
            <p className="mt-2">
              {overview.syncBoundaries.syncIntoConvex.join(". ")}.
            </p>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
