import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function BillingPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Track usage and billing state."
      title="Billing"
    >
      <DashboardPlaceholder
        checklist={[
          "Usage ledger pending",
          "Payment actions pending",
          "Cost breakdown pending",
        ]}
        description="This area will show usage, wallet state, and billing actions."
        highlights={[
          "Usage summary",
          "Balance state",
          "Payment actions",
          "Cost classes",
        ]}
        title="Billing and usage"
      />
    </DashboardShell>
  );
}
