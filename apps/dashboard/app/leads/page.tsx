import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function LeadsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Monitor contact quality, follow-up state, and the records that will feed outbound calling and Telegram alerts."
      title="Leads inbox"
    >
      <DashboardPlaceholder
        badge="Leads"
        checklist={[
          "Lead model arrives with campaign data",
          "Status filters follow immediately after",
          "Detail panel will connect transcripts later",
        ]}
        description="This route replaces the earlier generic contact placeholder and keeps the focus on sales and calling workflows."
        highlights={[
          "Lead table and filters",
          "Outcome and status columns",
          "Recent interaction history",
          "Campaign assignment",
        ]}
        title="Leads become the daily operator inbox"
      />
    </DashboardShell>
  );
}
