import { WorkspacePanel } from "@cloler/ui";

const bullets = [
    "Widget UI sandbox and preview app",
    "Contact capture and support flows",
    "Future voice-session integration surface"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
      <WorkspacePanel
        eyebrow="cloler.ai"
        title="Widget preview"
        description="Embeddable experience for inbound support conversations and voice sessions."
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
