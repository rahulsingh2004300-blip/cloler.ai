"use client";

import { createLogger, serializeError } from "@cloler/observability";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloler/ui";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useState } from "react";

const logger = createLogger("@cloler/dashboard/monitoring-test");

export default function MonitoringTestPage() {
  const [status, setStatus] = useState<string>("Ready");

  const triggerClientError = () => {
    try {
      throw new Error("Step 05 controlled client monitoring error.");
    } catch (error) {
      logger.error("Triggered controlled client monitoring error.", {
        error: serializeError(error),
      });
      Sentry.captureException(error, {
        tags: {
          area: "dashboard-client",
          scenario: "step-05-controlled-error",
        },
      });
      setStatus("Client error sent to Sentry. Check your Issues feed.");
    }
  };

  const triggerServerError = async () => {
    setStatus("Sending controlled server error...");

    const response = await fetch("/api/monitoring/test-error", {
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      message?: string;
    };

    setStatus(payload.message ?? "Server error triggered. Check Sentry.");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-start px-6 py-16">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <Badge className="w-fit" variant="secondary">
            Step 5
          </Badge>
          <CardTitle>Monitoring test surface</CardTitle>
          <CardDescription>
            Trigger one client-side and one server-side controlled error to verify Sentry wiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={triggerClientError} type="button" variant="outline">
              Trigger client error
            </Button>
            <Button onClick={triggerServerError} type="button">
              Trigger server error
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link href="/">Back to dashboard</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Status: {status}</p>
        </CardContent>
      </Card>
    </main>
  );
}
