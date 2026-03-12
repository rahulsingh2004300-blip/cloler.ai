import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";
import { VoiceLibraryWorkspace } from "./voice-library-workspace";

export default async function VoicesPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Create voice profiles, upload reference audio, and prepare cloned voices for calling workflows."
      title="Voices"
    >
      <VoiceLibraryWorkspace />
    </DashboardShell>
  );
}
