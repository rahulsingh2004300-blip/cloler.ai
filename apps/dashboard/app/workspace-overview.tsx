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
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { workspaceArgs, workspaceConfig } from "./workspace-config";

export function WorkspaceOverview() {
  const overview = useQuery(api.dashboard.getWorkspaceOverview, workspaceArgs);
  const ensureDemoWorkspace = useMutation(api.seed.ensureDemoWorkspace);
  const [status, setStatus] = useState<string>("");

  const handleSync = async () => {
    setStatus("Syncing...");

    try {
      await ensureDemoWorkspace({
        organizationSlug: workspaceConfig.organizationSlug,
        ownerEmail: workspaceConfig.viewerEmail,
        ownerName: workspaceConfig.viewerName,
      });

      setStatus("Workspace synced.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sync failed.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-start px-6 py-16">
      <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Dashboard
            </Badge>
            <CardTitle>Backend foundation shell</CardTitle>
            <CardDescription>Convex connection only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Status: {overview ? overview.status : "loading"}</p>
              <p>Workspace: {workspaceConfig.organizationSlug}</p>
              <p>Viewer: {workspaceConfig.viewerName}</p>
            </div>
            <Button className="w-fit" onClick={handleSync} type="button">
              Sync workspace
            </Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </CardContent>
        </Card>

        {overview ? (
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Seeded Convex data.</CardDescription>
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
                  {(overview.recentUsageEvents ?? []).map((event) => (
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
    </main>
  );
}
