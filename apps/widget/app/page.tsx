import {
  Button,
  DialogFrame,
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
  TextArea,
  TextInput,
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
        <DialogFrame
          eyebrow="Preview focus"
          title="Operator-approved contact capture"
          description="This preview uses the shared button, dialog, and form primitives so the widget can collect callback context cleanly before we attach voice sessions later."
          footer="The approved submission path will later normalize numbers, block DND contacts, and queue only valid outbound work."
        >
          <div className="grid gap-4">
            <TextInput
              label="Customer name"
              defaultValue="Aarav Sharma"
              placeholder="Aarav Sharma"
              hint="Shown in the callback queue and future support timeline."
            />
            <TextInput
              label="Phone number"
              defaultValue="+91 98765 43210"
              placeholder="+91 98765 43210"
              hint="Normalized and checked against suppression and DND filters before dialing."
            />
            <TextArea
              label="Reason for call"
              defaultValue="Need a Hindi follow-up call for tomorrow's property site visit."
              hint="This context will help the assistant pick the right workflow and tone."
            />
            <div className="flex flex-wrap gap-3">
              <Button>Queue callback</Button>
              <Button tone="secondary">Review fallback</Button>
            </div>
          </div>
        </DialogFrame>
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

      <div
        id="preview"
        className="rounded-[1.8rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-6"
      >
        <SectionHeading
          eyebrow="State preview"
          title="The first widget states are already grounded in the shared system"
          description="This is where callback capture, queue confirmation, and later voice-session entry points will stay visually consistent."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Primary job"
            value="Capture + route"
            note="Get the visitor into the right support flow quickly."
            emphasis
          />
          <MetricCard
            label="Next expansion"
            value="Voice session"
            note="Later steps wire this surface to live telephony and voice tooling."
          />
        </div>
      </div>
    </StudioShell>
  );
}
