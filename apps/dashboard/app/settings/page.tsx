import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function SettingsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Keep routing, organization defaults, and Telegram behavior in one place so the telephony worker can stay platform-managed."
      title="Workspace settings"
    >
      <DashboardPlaceholder
        badge="Settings"
        checklist={[
          "Org defaults land here",
          "Telegram connector settings follow",
          "Routing policies connect to telephony config",
        ]}
        description="This module will hold organization-level defaults for voice selection, hours, routing, booking, and notification behavior."
        highlights={[
          "Voice defaults",
          "Business hours and routing",
          "Telegram notifications",
          "Compliance preferences",
        ]}
        title="Operational defaults have a stable home"
      />
    </DashboardShell>
  );
}
