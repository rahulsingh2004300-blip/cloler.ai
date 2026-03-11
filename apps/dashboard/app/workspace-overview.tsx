"use client";

import { Badge } from "@cloler/ui/components/badge";
import { Button } from "@cloler/ui/components/button";
import {
  Card,
  CardContent,
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
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex gap-2">
                <Badge variant="secondary">Dashboard</Badge>
                <Badge variant="outline">Connecting</Badge>
              </div>
              <CardTitle>Convex workspace</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const isReady = overview.status === "ready";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Dashboard</Badge>
              <Badge variant="outline">Step 3</Badge>
            </div>
            <CardTitle>
              {isReady ? overview.organization.name : "Convex workspace"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase text-muted-foreground">
                  Status
                </div>
                <div className="mt-2 font-medium">
                  {isReady ? "Connected" : "Ready to seed"}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase text-muted-foreground">
                  Workspace
                </div>
                <div className="mt-2 font-medium">
                  {workspaceConfig.organizationSlug}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase text-muted-foreground">
                  Viewer
                </div>
                <div className="mt-2 font-medium">
                  {workspaceConfig.viewerName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleRefreshWorkspace} disabled={isRefreshing}>
                {isRefreshing ? "Syncing..." : "Sync workspace"}
              </Button>
              {feedback ? (
                <span className="text-sm text-muted-foreground">
                  {feedback}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {isReady ? (
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
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
                      <TableCell>
                        {formatCurrency(event.totalCostInr)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
