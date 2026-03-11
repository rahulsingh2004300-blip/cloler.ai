"use client";

import {
  CreateOrganization,
  OrganizationSwitcher,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cloler/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrganizationSelectionPage() {
  const { isLoaded, orgId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && orgId) {
      router.replace("/");
    }
  }, [isLoaded, orgId, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-start px-6 py-16">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">cloler.ai / onboarding</p>
            <h1 className="text-2xl font-semibold tracking-tight">Select an organization</h1>
          </div>
          <UserButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                Existing organization
              </Badge>
              <CardTitle>Switch organization</CardTitle>
              <CardDescription>Choose the active tenant before entering the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/" afterCreateOrganizationUrl="/" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                New organization
              </Badge>
              <CardTitle>Create organization</CardTitle>
              <CardDescription>Set up a new tenant workspace and continue to the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateOrganization afterCreateOrganizationUrl="/" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

