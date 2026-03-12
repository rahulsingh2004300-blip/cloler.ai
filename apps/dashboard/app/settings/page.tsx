import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function SettingsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Organization-level defaults and operating preferences now have a dedicated shell route in the dashboard."
      title="Workspace settings"
    >
      <DashboardPlaceholder
        badge="Settings"
        description="Step 6 reserves this space for organization defaults, hours, routing, and policy-level controls."
        highlights={["Org defaults", "Routing rules", "Operational policies"]}
        title="Settings route is in place"
      />
    </DashboardShell>
  );
}
