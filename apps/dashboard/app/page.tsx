import { DashboardShell } from "./dashboard-shell";
import { requireDashboardSession } from "./require-dashboard-session";
import { WorkspaceOverview } from "./workspace-overview";

export default async function HomePage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Navigate the authenticated workspace, inspect onboarding status, and keep the core tenant surface ready for the deeper modules that land next."
      title="Dashboard overview"
    >
      <WorkspaceOverview />
    </DashboardShell>
  );
}
