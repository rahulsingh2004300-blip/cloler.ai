"use client";

import {
  Button,
  DataTable,
  SectionHeading,
  StudioShell,
  type DataTableColumn,
} from "@cloler/ui";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { startTransition, useState } from "react";
import { workspaceArgs, workspaceConfig } from "./workspace-config";

type RecentUsageRow = {
  id: string;
  eventType: string;
  metricKey: string;
  quantity: number;
  totalCostInr: number;
  source: string;
  happenedAt: number;
};

const recentUsageColumns: DataTableColumn<RecentUsageRow>[] = [
  {
    key: "metric",
    header: "Metric",
    render: (event) => (
      <div>
        <p className="font-medium text-slate-900">
          {event.metricKey.replaceAll("_", " ")}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {event.eventType} via {event.source}
        </p>
      </div>
    ),
  },
  {
    key: "when",
    header: "When",
    render: (event) => formatDateTime(event.happenedAt),
  },
  {
    key: "units",
    header: "Units",
    align: "right",
    render: (event) => event.quantity,
  },
  {
    key: "cost",
    header: "Cost",
    align: "right",
    render: (event) => formatCurrency(event.totalCostInr),
  },
];

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
      setFeedback("Refreshing workspace data...");
    });

    void ensureDemoWorkspace({
      organizationSlug: workspaceConfig.organizationSlug,
      ownerEmail: workspaceConfig.viewerEmail,
      ownerName: workspaceConfig.viewerName,
    })
      .then((result) => {
        startTransition(() => {
          setFeedback(
            `Workspace ready: ${result.organizationName} (${result.createdRecords} new records synced).`,
          );
        });
      })
      .catch((error) => {
        startTransition(() => {
          setFeedback(
            error instanceof Error
              ? error.message
              : "Workspace refresh failed.",
          );
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
        title="Dashboard foundation"
        description="This page is connected to Convex and waiting for the first live response. The layout stays intentionally minimal while we finish the base platform setup."
        pills={["Convex", "Live query", "Step 3"]}
        actions={[
          {
            href: "#workspace",
            label: "Workspace panel",
            caption: "The dashboard will populate when the query resolves.",
          },
          {
            href: "#sync",
            label: "Sync notes",
            caption: "Telephony runtime stays outside this app for now.",
            variant: "secondary",
          },
        ]}
        metrics={[
          {
            label: "Convex",
            value: "Connecting",
            note: "Waiting for the first subscription payload.",
            emphasis: true,
          },
          {
            label: "Workspace",
            value: workspaceConfig.organizationSlug,
            note: "Default local workspace configuration.",
          },
          {
            label: "Viewer",
            value: workspaceConfig.viewerName,
            note: workspaceConfig.viewerEmail,
          },
        ]}
        spotlight={
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Status
            </p>
            <h2 className="text-xl font-semibold text-slate-950">
              Waiting for Convex data
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Once the query resolves, this page will show the workspace status,
              usage rows, and sync boundary notes.
            </p>
          </div>
        }
      >
        <section
          id="workspace"
          className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm lg:col-span-2"
        >
          <SectionHeading
            eyebrow="Workspace"
            title="Loading live workspace data"
            description="The dashboard is wired. Content will appear here as soon as the first response arrives from Convex."
          />
        </section>
        <section
          id="sync"
          className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm"
        >
          <SectionHeading
            eyebrow="Boundary"
            title="Control plane only"
            description="This app is for durable SaaS state, not real-time audio processing."
          />
        </section>
      </StudioShell>
    );
  }

  const isReady = overview.status === "ready";

  const metrics = isReady
    ? [
        {
          label: "Convex",
          value: "Connected",
          note: overview.organization.slug,
          emphasis: true,
        },
        {
          label: "Members",
          value: `${overview.counts.members}`,
          note: `${overview.counts.auditLogs} audit records available.`,
        },
        {
          label: "Call minutes",
          value: `${overview.usageSummary.callMinutes}`,
          note: `Avg ${formatCurrency(overview.usageSummary.averageCostPerMinuteInr)} / min`,
        },
      ]
    : [
        {
          label: "Convex",
          value: "Connected",
          note: "Workspace needs seed data.",
          emphasis: true,
        },
        {
          label: "Workspace",
          value: workspaceConfig.organizationSlug,
          note: "Ready to initialize.",
        },
        {
          label: "Viewer",
          value: workspaceConfig.viewerName,
          note: workspaceConfig.viewerEmail,
        },
      ];

  const spotlight = (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Workspace status
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {isReady
            ? overview.organization.name
            : "Workspace data not initialized yet"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isReady
            ? `Plan ${overview.organization.plan} with ${overview.organization.defaultVoiceTier} as the current default voice tier.`
            : "Use the seed action once to create the initial organization, users, usage events, and audit records."}
        </p>
      </div>
      <div className="grid gap-3 text-sm text-slate-600">
        <div className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3">
          <span className="font-medium text-slate-900">Viewer:</span>{" "}
          {workspaceConfig.viewerName}
        </div>
        <div className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3">
          <span className="font-medium text-slate-900">Organization:</span>{" "}
          {workspaceConfig.organizationSlug}
        </div>
      </div>
      <Button onClick={handleRefreshWorkspace} disabled={isRefreshing}>
        {isRefreshing
          ? "Refreshing..."
          : isReady
            ? "Re-seed workspace"
            : "Initialize workspace"}
      </Button>
      {feedback ? <p className="text-sm text-slate-500">{feedback}</p> : null}
    </div>
  );

  return (
    <StudioShell
      eyebrow="cloler.ai / dashboard"
      title="Dashboard foundation"
      description="This is the Step 3 control-plane shell. It shows that Convex is connected and the dashboard can read tenant-facing workspace data before auth and deeper product workflows are added."
      pills={["Convex", "Minimal scaffold", "Ready for Step 4"]}
      actions={[
        {
          href: "#workspace",
          label: "Workspace data",
          caption: "Review the seeded usage rows and basic workspace state.",
        },
        {
          href: "#sync",
          label: "Sync boundaries",
          caption:
            "See what belongs in Convex and what stays in telephony services.",
          variant: "secondary",
        },
      ]}
      metrics={metrics}
      spotlight={spotlight}
      footnote={
        <p>
          Keep this screen simple until authentication, organizations, and real
          workflows are added in the next steps.
        </p>
      }
    >
      <section
        id="workspace"
        className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm lg:col-span-2"
      >
        <SectionHeading
          eyebrow="Workspace data"
          title={isReady ? "Recent usage events" : "Workspace is ready to seed"}
          description={
            isReady
              ? "These records come from Convex and confirm that the dashboard wiring is working."
              : "Use the button above once to generate the first demo workspace records."
          }
        />
        <div className="mt-5">
          {isReady ? (
            <DataTable
              columns={recentUsageColumns}
              rows={overview.recentUsageEvents}
              emptyState="No usage events available."
            />
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--cl-color-line)] px-4 py-8 text-sm text-slate-500">
              No usage rows are available yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm">
        <SectionHeading
          eyebrow="Audit"
          title="Recent activity"
          description="A small audit list is enough for the current foundation step."
        />
        <div className="mt-5 space-y-3">
          {isReady ? (
            overview.auditFeed.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-900">
                  {entry.action.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-slate-500">{entry.summary}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--cl-color-line)] px-4 py-8 text-sm text-slate-500">
              Audit entries will appear after the workspace is seeded.
            </div>
          )}
        </div>
      </section>

      <section
        id="sync"
        className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm lg:col-span-3"
      >
        <SectionHeading
          eyebrow="Sync boundaries"
          title="Clear service ownership"
          description="The dashboard owns durable SaaS data. Real-time media and telephony runtime stay outside this app."
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Convex owns</p>
            <p className="mt-2 text-sm text-slate-600">
              {overview.syncBoundaries.convexOwned.join(". ")}.
            </p>
          </div>
          <div className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Telephony owns</p>
            <p className="mt-2 text-sm text-slate-600">
              {overview.syncBoundaries.telephonyOwned.join(". ")}.
            </p>
          </div>
          <div className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Sync into Convex
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {overview.syncBoundaries.syncIntoConvex.join(". ")}.
            </p>
          </div>
        </div>
      </section>
    </StudioShell>
  );
}
