import { FeatureCard, SectionHeading, StudioShell } from "@cloler/ui";

const actions = [
  {
    href: "#areas",
    label: "Planned areas",
    caption: "Compliance, support, and billing will live here.",
  },
  {
    href: "#next",
    label: "Next step",
    caption: "Role-based access will be added after auth is live.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Status",
    value: "Scaffold",
    note: "No admin workflows are implemented yet.",
    emphasis: true,
  },
  {
    label: "Focus",
    value: "Internal tools",
    note: "This app is reserved for platform operations.",
  },
  {
    label: "Next",
    value: "Access control",
    note: "Clerk auth and roles will gate this app in Step 4.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / admin"
      title="Admin console scaffold"
      description="This app is only a clean placeholder right now. It exists to establish routing, layout, and shared components before any internal operations workflows are built."
      pills={["Admin", "Internal", "Scaffold"]}
      actions={actions}
      metrics={metrics}
      spotlight={
        <div className="space-y-4" id="areas">
          <SectionHeading
            eyebrow="Planned use"
            title="Reserved for platform operations"
            description="Once auth and permissions are in place, this app will hold internal-only tools for compliance review, support, and billing supervision."
          />
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3">
              Compliance and DND review
            </li>
            <li className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3">
              Tenant support and escalations
            </li>
            <li className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3">
              Billing and platform health
            </li>
          </ul>
        </div>
      }
      footnote={
        <p id="next">
          This stays intentionally plain until protected admin workflows are
          implemented.
        </p>
      }
    >
      <FeatureCard
        title="Compliance queue"
        description="DND violations, consent issues, and outbound review tools will be added here later."
        detail="Future module"
        tone="accent"
      />
      <FeatureCard
        title="Tenant operations"
        description="Support actions, organization status changes, and manual review tools will live in this app."
        detail="Future module"
      />
      <FeatureCard
        title="Billing oversight"
        description="Internal payment and usage review surfaces will be added only after auth and org data are stable."
        detail="Future module"
        tone="warm"
      />
    </StudioShell>
  );
}
