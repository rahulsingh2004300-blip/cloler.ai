import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function AgentsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Shape how each organization's assistant sounds, responds, and stays within safe operating boundaries."
      title="Agent configuration"
    >
      <DashboardPlaceholder
        badge="Agents"
        description="This module is intentionally light in Step 6. The shell is ready for prompt presets, language defaults, and voice behavior settings in later steps."
        highlights={["Prompt presets", "Greeting rules", "Voice defaults"]}
        title="Navigation-ready agent workspace"
      />
    </DashboardShell>
  );
}
