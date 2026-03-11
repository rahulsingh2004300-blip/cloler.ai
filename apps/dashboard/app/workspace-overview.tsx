"use client";

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
      <section className="w-full space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">cloler.ai / dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Backend foundation shell</h1>
          <p className="text-sm text-slate-600">UI reset complete. Convex foundation remains connected.</p>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <p>Status: {overview ? overview.status : "loading"}</p>
          <p>Workspace: {workspaceConfig.organizationSlug}</p>
          <p>Viewer: {workspaceConfig.viewerName}</p>
        </div>

        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
          onClick={handleSync}
          type="button"
        >
          Sync workspace
        </button>

        {status ? <p className="text-sm text-slate-600">{status}</p> : null}

        {overview ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {(overview.recentUsageEvents ?? []).map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">{event.metricKey}</td>
                    <td className="px-4 py-3">{event.source}</td>
                    <td className="px-4 py-3">{event.quantity}</td>
                    <td className="px-4 py-3">{event.totalCostInr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}