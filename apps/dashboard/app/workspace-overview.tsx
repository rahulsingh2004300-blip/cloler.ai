"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@cloler/ui";
import { createLogger, serializeError } from "@cloler/observability";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";

const logger = createLogger("@cloler/dashboard/workspace-overview");

const moduleCards = [
  {
    title: "Voice workspace",
    value: "Clone + preview",
    note: "Upload samples, monitor clone jobs, and switch stock versus custom voices.",
  },
  {
    title: "Campaign flow",
    value: "Bulk-ready",
    note: "Prepare DND-safe imports, segment leads, and launch outbound batches.",
  },
  {
    title: "Telegram ops",
    value: "Connected path",
    note: "Keep operators updated on bookings, failures, and live call escalations.",
  },
];

export function WorkspaceOverview() {
  const { isLoaded: authLoaded, orgId, orgSlug } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { organization } = useOrganization();
  const ensureWorkspaceForViewer = useMutation(api.dashboard.ensureWorkspaceForViewer);
  const [status, setStatus] = useState<string>("");

  const organizationSlug = orgSlug ?? undefined;
  const viewerName = user?.fullName ?? user?.username ?? "Operator";

  const overviewArgs:
    | "skip"
    | {
        organizationSlug?: string;
      } = authLoaded && userLoaded && orgId ? { organizationSlug } : "skip";

  const overview = useQuery(api.dashboard.getWorkspaceOverview, overviewArgs);

  const handleWorkspaceSetup = async () => {
    if (!orgId) {
      setStatus("Select an organization before continuing.");
      return;
    }

    setStatus("Setting up workspace...");

    try {
      await ensureWorkspaceForViewer({ organizationSlug, organizationName: organization?.name });
      setStatus("Workspace ready.");
    } catch (error) {
      logger.error("Failed to initialize organization workspace.", {
        error: serializeError(error),
        organizationSlug,
        orgId,
      });
      setStatus(error instanceof Error ? error.message : "Setup failed.");
    }
  };

  if (!authLoaded || !userLoaded) {
    return (
      <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
        <CardHeader>
          <CardTitle>Loading workspace</CardTitle>
          <CardDescription>Checking your account and organization context.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!orgId) {
    return (
      <Card className="w-full max-w-2xl border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
        <CardHeader>
          <CardTitle>Organization required</CardTitle>
          <CardDescription>Create or select an organization to open the calling workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild type="button">
            <Link href="/org-selection">Open organization setup</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usageRows = overview?.recentUsageEvents ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Workspace</Badge>
              <Badge variant="outline">{overview?.status === "ready" ? "Ready" : "Onboarding"}</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl tracking-tight">
                {organization?.name ?? "Organization workspace"}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Manage cloned voices, campaigns, call activity, and Telegram visibility from one operator dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Operator</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{viewerName}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Organization</p>
                <p className="mt-2 truncate text-lg font-semibold text-foreground">
                  {organization?.name ?? organizationSlug ?? orgId}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Rollout state</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{overview?.status ?? "Loading"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {overview?.status !== "ready" ? (
                <Button onClick={handleWorkspaceSetup} type="button">
                  Initialize workspace
                </Button>
              ) : null}
              <Button asChild type="button" variant="outline">
                <Link href="/voices">Open voice workspace</Link>
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/campaigns">Review campaign shell</Link>
              </Button>
            </div>

            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle className="text-base">This week's build focus</CardTitle>
            <CardDescription>Only the modules that matter for the calling product stay visible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {moduleCards.map((item) => (
              <div
                className="rounded-2xl border border-border/70 bg-background/85 px-4 py-4"
                key={item.title}
              >
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">{item.title}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">Voice readiness</CardTitle>
            <CardDescription>Cloned and stock voice controls will land here next.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{overview?.status === "ready" ? "Ready" : "Pending"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with sample uploads, preview generation, and default voice selection.</p>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">Recent usage rows</CardTitle>
            <CardDescription>Seeded operational data already available in Convex.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{usageRows.length}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">These rows will later roll into dashboard analytics, billing, and campaign reporting.</p>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">Next operational hook</CardTitle>
            <CardDescription>Telegram remains the fastest customer-facing connection path.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">Telegram</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Bookings, escalations, and failed call alerts will be pushed there instead of through a public widget.</p>
          </CardContent>
        </Card>
      </div>

      {overview?.status === "ready" ? (
        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>Usage snapshot</CardTitle>
            <CardDescription>Organization-scoped records flowing through the current backend foundation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageRows.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.metricKey}</TableCell>
                    <TableCell>{event.source}</TableCell>
                    <TableCell>{event.quantity}</TableCell>
                    <TableCell>{event.totalCostInr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
