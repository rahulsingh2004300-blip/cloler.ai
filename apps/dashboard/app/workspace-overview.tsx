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
const upcomingModules = ["Agents", "Knowledge", "Calls", "Contacts", "Billing", "Settings"];

export function WorkspaceOverview() {
  const { isLoaded: authLoaded, orgId, orgSlug } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { organization } = useOrganization();
  const ensureWorkspaceForViewer = useMutation(api.dashboard.ensureWorkspaceForViewer);
  const [status, setStatus] = useState<string>("");

  const organizationSlug = orgSlug ?? undefined;
  const viewerEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;

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
      <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
        <CardHeader>
          <CardTitle>Loading workspace...</CardTitle>
          <CardDescription>Checking your authentication and organization context.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!orgId) {
    return (
      <Card className="w-full max-w-2xl border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
        <CardHeader>
          <CardTitle>Organization required</CardTitle>
          <CardDescription>Select or create an organization to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild type="button">
            <Link href="/org-selection">Open organization setup</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Step 4 live
            </Badge>
            <CardTitle>Tenant-safe auth foundation</CardTitle>
            <CardDescription>
              {overview?.status === "ready"
                ? "Your organization workspace is connected and ready for deeper modules."
                : "Finish workspace onboarding for this organization before moving into feature modules."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {overview?.status ?? "Loading"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    Organization
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold text-foreground">
                    {organization?.name ?? organizationSlug ?? orgId}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    Signed-in user
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold text-foreground">
                    {user?.fullName ?? user?.username ?? viewerEmail ?? "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {overview?.status !== "ready" ? (
                  <Button className="w-fit" onClick={handleWorkspaceSetup} type="button">
                    Initialize organization workspace
                  </Button>
                ) : null}
                {process.env.NODE_ENV !== "production" ? (
                  <Button asChild type="button" variant="outline">
                    <Link href="/monitoring-test">Open monitoring test</Link>
                  </Button>
                ) : null}
              </div>

              {status ? (
                <p className="text-sm text-muted-foreground">{status}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Step 6 keeps the overview lean while the sidebar unlocks the future dashboard modules.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Next modules
            </Badge>
            <CardTitle>Step 6 navigation is in place</CardTitle>
            <CardDescription>These routes are scaffolded and ready for deeper feature work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingModules.map((item) => (
              <div
                className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground"
                key={item}
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {overview?.status === "ready" ? (
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
          <CardHeader>
            <CardTitle>Usage snapshot</CardTitle>
            <CardDescription>Organization-scoped Convex records from the current foundation.</CardDescription>
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
                {overview.recentUsageEvents.map((event) => (
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
