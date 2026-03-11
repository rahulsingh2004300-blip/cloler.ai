"use client";

import { Badge } from "@cloler/ui/components/badge";
import { Button } from "@cloler/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloler/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@cloler/ui/components/table";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { startTransition, useState } from "react";
import { workspaceArgs, workspaceConfig } from "./workspace-config";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function WorkspaceOverview() {
  const overview = useQuery(api.dashboard.getWorkspaceOverview, workspaceArgs);
  const ensureDemoWorkspace = useMutation(api.seed.ensureDemoWorkspace);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshWorkspace = () => {
    startTransition(() => {
      setIsRefreshing(true);
      setFeedback(null);
    });

    void ensureDemoWorkspace({
      organizationSlug: workspaceConfig.organizationSlug,
      ownerEmail: workspaceConfig.viewerEmail,
      ownerName: workspaceConfig.viewerName,
    })
      .then(() => {
        startTransition(() => {
          setFeedback("Workspace synced.");
        });
      })
      .catch((error) => {
        startTransition(() => {
          setFeedback(error instanceof Error ? error.message : "Sync failed.");
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
      <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge>Dashboard</Badge>
                <Badge variant="outline">Connecting</Badge>
              </div>
              <CardTitle className="text-2xl tracking-tight">Convex workspace</CardTitle>
              <CardDescription>Loading foundation data</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  const isReady = overview.status === "ready";

  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
      <div className="mx-auto grid max-w-6xl gap-6">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Dashboard</Badge>
              <Badge variant="outline">Step 3</Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight">
              {isReady ? overview.organization.name : "Convex workspace"}
            </CardTitle>
            <CardDescription>Backend foundation connected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-slate-200/80 bg-white shadow-none">
                <CardHeader className="gap-1">
                  <CardDescription>Status</CardDescription>
                  <CardTitle className="text-lg">
                    {isReady ? "Connected" : "Ready to seed"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200/80 bg-white shadow-none">
                <CardHeader className="gap-1">
                  <CardDescription>Workspace</CardDescription>
                  <CardTitle className="text-lg">
                    {workspaceConfig.organizationSlug}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200/80 bg-white shadow-none">
                <CardHeader className="gap-1">
                  <CardDescription>Viewer</CardDescription>
                  <CardTitle className="text-lg">
                    {workspaceConfig.viewerName}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleRefreshWorkspace} disabled={isRefreshing}>
                {isRefreshing ? "Syncing..." : "Sync workspace"}
              </Button>
              {feedback ? (
                <span className="text-sm text-muted-foreground">{feedback}</span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {isReady ? (
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl tracking-tight">Usage</CardTitle>
              <CardDescription>Seeded Convex data for Step 3</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-slate-200/80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.recentUsageEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.metricKey}</TableCell>
                        <TableCell>{event.source}</TableCell>
                        <TableCell>{event.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(event.totalCostInr)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}