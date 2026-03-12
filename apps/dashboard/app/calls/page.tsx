import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function CallsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="This shell keeps telephony operations one click away once call logs, routing, and live activity begin landing."
      title="Call operations"
    >
      <DashboardPlaceholder
        badge="Calls"
        description="Step 6 makes the route available with a stable layout. The real log table, live status, and transcript views arrive in the telephony phases."
        highlights={["Live queue", "Call logs", "Outcome timeline"]}
        title="Operations route is ready"
      />
    </DashboardShell>
  );
}
