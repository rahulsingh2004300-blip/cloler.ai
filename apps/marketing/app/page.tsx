import { FeatureCard, SectionHeading, StudioShell } from "@cloler/ui";

const actions = [
  {
    href: "#overview",
    label: "Project overview",
    caption: "See what is included in Steps 1 to 3.",
  },
  {
    href: "#readiness",
    label: "Foundation status",
    caption: "Shared UI and app shells are ready for Step 4.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Stage",
    value: "Step 1-3",
    note: "Foundation, shared UI, and Convex setup only.",
    emphasis: true,
  },
  {
    label: "Apps",
    value: "4",
    note: "Marketing, dashboard, admin, and widget are running locally.",
  },
  {
    label: "Next",
    value: "Step 4",
    note: "Authentication and organization isolation.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / marketing"
      title="Clean project scaffold for cloler.ai"
      description="This page is intentionally minimal right now. Steps 1 to 3 are only about repo setup, shared UI, and backend foundation, so this surface should stay simple until real marketing content is designed later."
      pills={["Monorepo", "Shared UI", "Convex foundation"]}
      actions={actions}
      metrics={metrics}
      spotlight={
        <div className="space-y-4" id="overview">
          <SectionHeading
            eyebrow="Current scope"
            title="Only the foundation is built so far"
            description="No pricing, case studies, or full landing-page copy yet. The goal here is a professional shell that proves the apps are wired correctly."
          />
          <div className="rounded-xl border border-[color:var(--cl-color-line)] bg-slate-50 p-4 text-sm text-slate-600">
            Monorepo setup, shared components, and Convex wiring are ready.
            Product content and conversion-focused marketing come later.
          </div>
        </div>
      }
      footnote={
        <p>Keep this app simple until the actual website content is planned.</p>
      }
    >
      <FeatureCard
        title="Monorepo foundation"
        description="Apps, packages, scripts, and repo standards are now in place and ready for feature work."
        detail="Step 1"
        tone="accent"
      />
      <FeatureCard
        title="Shared UI foundation"
        description="The common layout, buttons, inputs, and cards are reusable across all app surfaces."
        detail="Step 2"
      />
      <FeatureCard
        title="Backend connection"
        description="Convex is connected so the dashboard can move into auth and tenant-aware flows next."
        detail="Step 3"
        tone="warm"
      />
    </StudioShell>
  );
}
