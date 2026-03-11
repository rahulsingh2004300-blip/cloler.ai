import {
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
} from "@cloler/ui";

const actions = [
  {
    href: "#preview",
    label: "Preview widget shell",
    caption:
      "Test the embeddable support experience before telephony wiring lands.",
  },
  {
    href: "#states",
    label: "Review widget states",
    caption:
      "Loading, contact capture, selection, and fallback paths stay intentional.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Embed target",
    value: "Lightweight",
    note: "The widget stays fast even as voice features grow later.",
  },
  {
    label: "State model",
    value: "Session-based",
    note: "Contact sessions and validations come before live voice calls.",
    emphasis: true,
  },
  {
    label: "Voice tiers",
    value: "Selectable",
    note: "Stock voice first, premium voice later.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / widget"
      title="An embeddable support surface that can grow into live voice without losing clarity."
      description="The widget foundation should feel compact, friendly, and operationally clear. It needs to support contact capture, selection flows, agent handoff, and later voice sessions without becoming visually noisy."
      pills={["Embeddable", "Session-aware", "Voice-ready"]}
      actions={actions}
      metrics={metrics}
      footnote={
        <p>
          Step 02 gives the widget its own visual personality while keeping it
          aligned with the dashboard and admin system around shared cards,
          actions, and metrics.
        </p>
      }
      spotlight={
        <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <SectionHeading
            eyebrow="Preview focus"
            title="States matter more than polish theater"
            description="The widget must make loading, invalid-session, contact, and active-conversation states obvious, because these are the states that affect real support outcomes later."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Primary job"
              value="Capture + route"
              note="Get the user into the right support flow quickly."
              emphasis
            />
            <MetricCard
              label="Next expansion"
              value="Voice session"
              note="Later steps wire it to live telephony and voice tooling."
            />
          </div>
        </div>
      }
    >
      <FeatureCard
        title="Contact-first UX"
        description="The widget will earn trust by being clear about who is calling, what happens next, and when a human takes over."
        detail="Conversation entry"
        tone="accent"
      />
      <FeatureCard
        title="Reusable states"
        description="Selection, loading, validation, and fallback views can all be built from the same shared primitives introduced here."
        detail="State architecture"
      />
      <FeatureCard
        title="Embed-ready language"
        description="The visual system is compact enough to sit inside another site without feeling like a totally separate product."
        detail="Widget presence"
        tone="warm"
      />
    </StudioShell>
  );
}
