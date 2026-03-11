import {
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
} from "@cloler/ui";

const actions = [
  {
    href: "#operators",
    label: "Open operator cockpit",
    caption: "The command center for voices, calls, billing, and knowledge.",
  },
  {
    href: "#tenant-settings",
    label: "Review org controls",
    caption:
      "Behavior settings stay tenant-facing while provider keys stay hidden.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Org model",
    value: "Multi-tenant",
    note: "Clerk orgs plus Convex-backed product data in later steps.",
  },
  {
    label: "Voice modes",
    value: "3 tiers",
    note: "Bulbul v2, Bulbul v3, and cloned voices.",
    emphasis: true,
  },
  {
    label: "Bulk calling",
    value: "DND-safe",
    note: "Approved and rejected sheets are part of the operator workflow.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / dashboard"
      title="An operator cockpit for voice cloning, telephony, and revenue controls."
      description="The dashboard should feel like one control plane for everything a customer org owns: voices, call behavior, bulk calling inputs, analytics, billing, and future knowledge workflows."
      pills={["Tenant-safe", "Provider-owned infra", "Billing-aware"]}
      actions={actions}
      metrics={metrics}
      footnote={
        <p>
          This surface is where customers will configure behavior. Provider
          credentials remain platform-owned, which keeps onboarding cheaper and
          cleaner for end users.
        </p>
      }
      spotlight={
        <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <SectionHeading
            eyebrow="Workspace pillars"
            title="Everything is organized around operations"
            description="The design system gives us one visual grammar for settings, metrics, inboxes, billing, and telephony health instead of rebuilding each area independently."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Calls"
              value="Live + historical"
              note="Inbound, outbound, escalated, and failed."
            />
            <MetricCard
              label="Voices"
              value="Stock + cloned"
              note="Each tier has a clear cost story."
              emphasis
            />
          </div>
        </div>
      }
    >
      <FeatureCard
        title="Voice configuration"
        description="Customers will select the cheapest acceptable default voice tier and only upgrade when use cases require better quality or custom voice identity."
        detail="Margin protection"
        tone="accent"
      />
      <FeatureCard
        title="Knowledge and prompts"
        description="Future RAG, instructions, and agent behaviors plug into a surface that already supports structured cards, stats, and actions."
        detail="AI operations"
      />
      <FeatureCard
        title="Billing visibility"
        description="Usage, premium voice tiers, and low-cost defaults can all be explained from one consistent dashboard language."
        detail="Revenue UX"
        tone="warm"
      />
    </StudioShell>
  );
}
