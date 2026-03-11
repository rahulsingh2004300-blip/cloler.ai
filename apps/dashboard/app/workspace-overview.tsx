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
import {
  OrganizationSwitcher,
  UserButton,
  useAuth,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";

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
      await ensureWorkspaceForViewer({
        organizationSlug,
        organizationName: organization?.name,
      });
      setStatus("Workspace ready.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Setup failed.");
    }
  };

  if (!authLoaded || !userLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Loading workspace...</CardTitle>
            <CardDescription>Checking your authentication and organization context.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!orgId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
        <Card className="w-full max-w-2xl">
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
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-start px-6 py-16">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">cloler.ai / dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight">Authenticated workspace</h1>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/" afterLeaveOrganizationUrl="/org-selection" />
            <UserButton />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Step 4
            </Badge>
            <CardTitle>Tenant-safe auth foundation</CardTitle>
            <CardDescription>
              {overview?.status === "ready"
                ? "Your organization workspace is connected."
                : "Finish workspace onboarding for this organization."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Signed-in user: {user?.fullName ?? user?.username ?? viewerEmail ?? "Unknown"}</p>
              <p>Organization: {organization?.name ?? organizationSlug ?? orgId}</p>
              <p>Status: {overview?.status ?? "loading"}</p>
            </div>
            {overview?.status !== "ready" ? (
              <Button className="w-fit" onClick={handleWorkspaceSetup} type="button">
                Initialize organization workspace
              </Button>
            ) : null}
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </CardContent>
        </Card>

        {overview?.status === "ready" ? (
          <Card>
            <CardHeader>
              <CardTitle>Usage snapshot</CardTitle>
              <CardDescription>Organization-scoped Convex records.</CardDescription>
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
    </main>
  );
}

