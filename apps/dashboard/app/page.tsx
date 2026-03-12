import { DashboardShell } from "./dashboard-shell";
import { requireDashboardSession } from "./require-dashboard-session";
import { WorkspaceOverview } from "./workspace-overview";

export default async function HomePage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Run cloned-voice calling, monitor lead flow, and keep Telegram and billing operations close without digging through filler screens."
      title="Voice calling command center"
    >
      <WorkspaceOverview />
    </DashboardShell>
  );
}
