import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function KnowledgePage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Manage knowledge sources for the assistant."
      title="Knowledge"
    >
      <DashboardPlaceholder
        checklist={[
          "File library pending",
          "Embedding pipeline pending",
          "Retrieval settings pending",
        ]}
        description="This area will hold files, indexing state, and knowledge controls."
        highlights={[
          "File library",
          "Index status",
          "Retrieval rules",
          "Source visibility",
        ]}
        title="Knowledge base"
      />
    </DashboardShell>
  );
}
