import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function AgentsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Define how the assistant speaks, when it escalates, and which voice path it should use in live calls."
      title="Agent behavior"
    >
      <DashboardPlaceholder
        badge="Agents"
        checklist={[
          "Prompt presets are queued",
          "Language defaults stay tenant-safe",
          "Fallback behavior is planned before live calls",
        ]}
        description="This workspace will hold the configuration that connects prompts, greetings, and voice defaults to real campaigns."
        highlights={[
          "System prompt presets",
          "Greeting and tone controls",
          "Transfer and fallback logic",
          "Language and compliance rules",
        ]}
        title="Assistant configuration stays operational"
      />
    </DashboardShell>
  );
}
