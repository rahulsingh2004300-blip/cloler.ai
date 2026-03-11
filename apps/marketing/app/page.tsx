import { WorkspacePanel } from "@cloler/ui";

const bullets = [
    "Brand story and landing page shell",
    "Future pricing and compliance content",
    "Lead capture for demos and sales"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-12">
      <WorkspacePanel
        eyebrow="cloler.ai"
        title="Marketing surface"
        description="Public-facing site for cloler.ai with room for positioning, pricing, and product education."
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
