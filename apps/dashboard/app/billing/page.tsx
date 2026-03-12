import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function BillingPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Usage and billing now have a stable destination in the shell, which makes later monetization work easier to drop in."
      title="Billing and usage"
    >
      <DashboardPlaceholder
        badge="Billing"
        description="The billing route is ready for plan details, usage rollups, and payment controls when the billing step begins."
        highlights={["Usage rollups", "Plan state", "Payment actions"]}
        title="Revenue module is queued"
      />
    </DashboardShell>
  );
}
