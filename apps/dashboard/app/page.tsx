import { WorkspacePanel } from "@cloler/ui";

const bullets = [
    "Organization-aware SaaS workspace",
    "Voice and telephony configuration surface",
    "Call logs, billing, and knowledge workflows"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
      <WorkspacePanel
        eyebrow="cloler.ai"
        title="Customer dashboard"
        description="Tenant workspace for voice cloning, telephony settings, analytics, and billing."
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
