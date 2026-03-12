import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function CallsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Monitor live call activity and outcomes."
      title="Calls"
    >
      <DashboardPlaceholder
        checklist={[
          "Live queue pending",
          "Call log pending",
          "Transcript drawer pending",
        ]}
        description="This area becomes the operational call monitoring surface."
        highlights={[
          "Live queue",
          "Call logs",
          "Outcomes",
          "Transcripts",
        ]}
        title="Call operations"
      />
    </DashboardShell>
  );
}
