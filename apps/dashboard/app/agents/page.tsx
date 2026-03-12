import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function AgentsPage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Configure assistant behavior and defaults."
      title="Agents"
    >
      <DashboardPlaceholder
        checklist={[
          "Prompt editor pending",
          "Behavior controls pending",
          "Fallback logic pending",
        ]}
        description="This area will hold prompt, language, and routing defaults."
        highlights={[
          "Prompt presets",
          "Tone settings",
          "Language rules",
          "Fallback flow",
        ]}
        title="Agent configuration"
      />
    </DashboardShell>
  );
}
