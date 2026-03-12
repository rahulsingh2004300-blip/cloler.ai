import { DashboardPlaceholder } from "../dashboard-placeholder";
import { DashboardShell } from "../dashboard-shell";
import { requireDashboardSession } from "../require-dashboard-session";

export default async function KnowledgePage() {
  await requireDashboardSession();

  return (
    <DashboardShell
      description="Keep the retrieval and knowledge surfaces discoverable now so Step 13 can land without another layout rewrite."
      title="Knowledge base"
    >
      <DashboardPlaceholder
        badge="Knowledge"
        description="Step 6 only prepares the route and shell. Upload, indexing, and RAG-specific controls come later."
        highlights={["File library", "Embedding pipeline", "Retrieval settings"]}
        title="Knowledge route is scaffolded"
      />
    </DashboardShell>
  );
}
