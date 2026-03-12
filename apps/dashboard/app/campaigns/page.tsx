import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function CampaignsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Prepare and monitor outbound calling batches."
      title="Campaigns"
    >
      <DashboardPlaceholder
        checklist={[
          "Upload review pending",
          "Queue status pending",
          "Campaign analytics pending",
        ]}
        description="This area will control bulk calling jobs and queue health."
        highlights={[
          "Upload jobs",
          "Approved rows",
          "Rejected rows",
          "Dispatch queue",
        ]}
        title="Campaign control"
      />
    </DashboardShell>
  );
}
