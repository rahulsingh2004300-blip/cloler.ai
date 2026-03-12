import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function ContactsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Give the dashboard a clean place for contacts and bulk-calling readiness before the DND-safe importer arrives."
      title="Contacts and sessions"
    >
      <DashboardPlaceholder
        badge="Contacts"
        description="This route is reserved for lead records, support sessions, and bulk outreach preparation once the underlying data model lands."
        highlights={["Lead records", "Session history", "Upload review"]}
        title="Contact workspace is scaffolded"
      />
    </DashboardShell>
  );
}
