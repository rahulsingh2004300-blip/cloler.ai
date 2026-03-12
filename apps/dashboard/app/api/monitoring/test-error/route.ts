import { createLogger, serializeError } from "@cloler/observability";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

const logger = createLogger("@cloler/dashboard/api/monitoring-test");

export async function GET() {
  const error = new Error("Step 05 controlled monitoring route error.");

  logger.error("Controlled monitoring route was triggered.", {
    error: serializeError(error),
  });

  Sentry.captureException(error, {
    tags: {
      area: "dashboard-api",
      scenario: "step-05-controlled-error",
    },
  });

  await Sentry.flush(2000);

  return NextResponse.json(
    {
      ok: false,
      message: "Controlled server error captured for monitoring.",
    },
    {
      status: 500,
    },
  );
}

