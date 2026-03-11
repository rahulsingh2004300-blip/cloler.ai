import { WorkspacePanel } from "@cloler/ui";

const bullets = [
    "Cross-tenant operations visibility",
    "Compliance and audit review flows",
    "Support and incident management"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
      <WorkspacePanel
        eyebrow="cloler.ai"
        title="Admin console"
        description="Internal operating surface for monitoring tenants, compliance, and system health."
        bullets={bullets}
        footer={
          <p className="text-sm text-slate-500">
            Step 01 foundation is in place. Next we wire auth, data, and telephony services.
          </p>
        }
      />
    </main>
  );
}
