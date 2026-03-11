import {
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
} from "@cloler/ui";

const actions = [
  {
    href: "#positioning",
    label: "Shape the category",
    caption: "Messaging for Indian voice AI with owned economics.",
  },
  {
    href: "#economics",
    label: "Show the unit economics",
    caption: "Make the Rs 2/min target visible from day one.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Reference repos",
    value: "2",
    note: "InboundAIVoice plus resonance anchor the build direction.",
  },
  {
    label: "Delivery surfaces",
    value: "4",
    note: "Marketing, dashboard, admin, and widget all share one system.",
    emphasis: true,
  },
  {
    label: "Target call cost",
    value: "~Rs 2/min",
    note: "Default path assumes Vobiz + Sarvam Bulbul v2 + Groq.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / marketing"
      title="Voice AI infrastructure with owned margins, not rented margins."
      description="The public surface sets up cloler.ai as the low-cost Indian voice AI stack for agencies, founders, and operators who want custom voices, compliant bulk calling, and full control over deployment economics."
      pills={[
        "InboundAIVoice-inspired",
        "Resonance-inspired",
        "DND-safe outbound",
      ]}
      actions={actions}
      metrics={metrics}
      footnote={
        <p>
          Step 02 turns the placeholder workspace into a coherent brand system
          that we can extend across every app without redoing the visual
          language later.
        </p>
      }
      spotlight={
        <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <SectionHeading
            eyebrow="Positioning"
            title="Why this stack is cheaper"
            description="The operator story should always connect product UX to owned infrastructure: Vobiz for Indian telephony, Sarvam for speech, Groq for low-cost reasoning, and optional premium voice tiers only when needed."
          />
          <div className="mt-6 grid gap-3">
            <MetricCard
              label="Stock voice path"
              value="Bulbul v2"
              note="Default tier tuned for cost discipline."
              emphasis
            />
            <MetricCard
              label="Premium tiers"
              value="Bulbul v3 + cloned voices"
              note="Sold as upgrades, not defaults."
            />
          </div>
        </div>
      }
    >
      <FeatureCard
        title="Clear product narrative"
        description="The site can explain the split between low-cost stock calling and premium cloned-voice calling without confusing buyers."
        detail="Category education"
        tone="accent"
      />
      <FeatureCard
        title="Built-in compliance message"
        description="Bulk upload workflows, DND handling, consent, and audit posture become core selling points instead of afterthoughts."
        detail="Trust layer"
        tone="warm"
      />
      <FeatureCard
        title="Conversion-ready foundation"
        description="We now have a reusable marketing shell for pricing, demos, FAQs, and comparison pages once those flows are built."
        detail="Go-to-market surface"
      />
    </StudioShell>
  );
}
