import {
  FeatureCard,
  MetricCard,
  SectionHeading,
  StudioShell,
} from "@cloler/ui";

const actions = [
  {
    href: "#operations",
    label: "Monitor system health",
    caption: "Review tenant activity, telephony health, and incidents.",
  },
  {
    href: "#reviews",
    label: "Open compliance queue",
    caption:
      "Consent, DND violations, and abuse review stay operationally visible.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Admin lens",
    value: "Cross-tenant",
    note: "Support, finance, compliance, and platform health in one place.",
  },
  {
    label: "Alerts",
    value: "Telegram-first",
    note: "Fast operator feedback for bookings, failures, and escalations.",
    emphasis: true,
  },
  {
    label: "Audit stance",
    value: "Traceable",
    note: "Voice consent and DND outcomes become first-class records.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / admin"
      title="Internal operations that keep a legally sensitive voice product under control."
      description="The admin console is where internal teams supervise tenant health, payment issues, compliance events, suspicious voice usage, and bulk-calling violations before they become platform risk."
      pills={["Compliance-first", "Platform monitoring", "Support tooling"]}
      actions={actions}
      metrics={metrics}
      footnote={
        <p>
          The design foundation intentionally makes admin feel more operational
          and less marketing-like, while still staying in the same family as the
          customer-facing apps.
        </p>
      }
      spotlight={
        <div className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <SectionHeading
            eyebrow="Ops focus"
            title="The riskiest workflows stay visible"
            description="This is where we will surface DND rejection spikes, abusive outbound patterns, consent issues, payment failures, and telephony provider incidents."
          />
          <div className="mt-6 grid gap-3">
            <MetricCard
              label="Critical queue"
              value="Violations + incidents"
              note="Prioritize platform-protecting actions first."
              emphasis
            />
            <MetricCard
              label="Support queue"
              value="Org-level issues"
              note="Escalations, refunds, and unusual usage patterns."
            />
          </div>
        </div>
      }
    >
      <FeatureCard
        title="Compliance review"
        description="Rejected DND rows, blocked outbound attempts, and consent gaps will all live under one reusable review surface."
        detail="Risk control"
        tone="accent"
      />
      <FeatureCard
        title="Operational analytics"
        description="Bookings, escalations, failures, and cost-per-call can share one visual system so internal teams see the same truth fast."
        detail="Platform visibility"
      />
      <FeatureCard
        title="Abuse intervention"
        description="The shared card system is ready for org suspension, manual review, and audit evidence screens without a redesign later."
        detail="Internal tooling"
        tone="warm"
      />
    </StudioShell>
  );
}
