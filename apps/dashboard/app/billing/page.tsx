import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function BillingPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Track usage, wallet state, and pay-as-you-go readiness without asking customers to bring their own provider accounts."
      title="Billing and usage"
    >
      <DashboardPlaceholder
        badge="Billing"
        checklist={[
          "Usage ledger lands with Razorpay work",
          "Stock versus cloned voice classes stay separate",
          "Operator spending summary comes first",
        ]}
        description="This module is where usage, top-ups, and pricing visibility will be shaped into a customer-ready billing surface."
        highlights={[
          "Usage summary",
          "Wallet or balance state",
          "Razorpay actions",
          "Cost class breakdown",
        ]}
        title="Billing stays close to real usage"
      />
    </DashboardShell>
  );
}
