import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function CallsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Keep live queue, transcripts, and call outcomes one click away once telephony data starts landing from the worker."
      title="Call operations"
    >
      <DashboardPlaceholder
        badge="Calls"
        checklist={[
          "Route is live",
          "Telephony feed plugs in later",
          "Transcript and summary panels follow",
        ]}
        description="This is the eventual operations hub for live call activity, call history, and escalations."
        highlights={[
          "Live queue",
          "Call log table",
          "Outcome timeline",
          "Transcript drawer",
        ]}
        title="Call monitoring shell is ready"
      />
    </DashboardShell>
  );
}
