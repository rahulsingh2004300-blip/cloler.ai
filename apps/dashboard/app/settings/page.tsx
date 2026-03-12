import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function SettingsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Manage organization defaults and integrations."
      title="Settings"
    >
      <DashboardPlaceholder
        checklist={[
          "Organization defaults pending",
          "Telegram settings pending",
          "Routing rules pending",
        ]}
        description="This area will hold default configuration for the workspace."
        highlights={[
          "Voice defaults",
          "Hours and routing",
          "Telegram",
          "Policies",
        ]}
        title="Workspace settings"
      />
    </DashboardShell>
  );
}
