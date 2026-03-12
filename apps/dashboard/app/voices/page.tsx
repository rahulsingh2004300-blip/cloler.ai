import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function VoicesPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Build and manage the voice library your campaigns will actually use, from sample upload to preview generation."
      title="Voice workspace"
    >
      <DashboardPlaceholder
        badge="Voices"
        checklist={[
          "Voice table is reserved",
          "Upload pipeline lands next",
          "Preview generation follows cloning setup",
        ]}
        description="This module will hold cloned voices, stock Sarvam defaults, and preview history for each organization."
        highlights={[
          "Reference audio uploads",
          "Clone job status",
          "Preview audio history",
          "Stock versus custom defaults",
        ]}
        title="Voice library is the next build focus"
      />
    </DashboardShell>
  );
}
