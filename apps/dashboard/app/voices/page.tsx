import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function VoicesPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Manage voice assets and preview readiness."
      title="Voices"
    >
      <DashboardPlaceholder
        checklist={[
          "Upload panel pending",
          "Clone status pending",
          "Preview player pending",
        ]}
        description="This area will hold cloned and stock voice controls."
        highlights={[
          "Audio uploads",
          "Voice status",
          "Preview history",
          "Default selection",
        ]}
        title="Voice library"
      />
    </DashboardShell>
  );
}
