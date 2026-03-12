import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function CampaignsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Prepare bulk calling waves, monitor queue health, and separate approved rows from blocked or DND-rejected contacts."
      title="Campaign control"
    >
      <DashboardPlaceholder
        badge="Campaigns"
        checklist={[
          "Bulk upload review lands here",
          "Queue status follows after lead import",
          "Campaign analytics will connect to billing",
        ]}
        description="This module will become the launch surface for agency bulk calling, suppression checks, and schedule control."
        highlights={[
          "Upload job review",
          "Approved versus rejected rows",
          "Queue and dispatch status",
          "Campaign performance summary",
        ]}
        title="Campaign workspace is reserved for outbound execution"
      />
    </DashboardShell>
  );
}
