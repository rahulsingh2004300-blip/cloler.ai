import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function LeadsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Track contacts and follow-up state."
      title="Leads"
    >
      <DashboardPlaceholder
        checklist={[
          "Lead table pending",
          "Filters pending",
          "Detail drawer pending",
        ]}
        description="This area becomes the lead inbox for calling workflows."
        highlights={[
          "Lead table",
          "Filters",
          "Status history",
          "Campaign link",
        ]}
        title="Lead workspace"
      />
    </DashboardShell>
  );
}
