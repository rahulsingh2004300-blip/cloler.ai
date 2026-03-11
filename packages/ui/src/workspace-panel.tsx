import type { ReactNode } from "react";
import { FeatureCard } from "./feature-card";
import { SectionHeading } from "./section-heading";

export type WorkspacePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  footer?: ReactNode;
};

export function WorkspacePanel({
  eyebrow,
  title,
  description,
  bullets,
  footer,
}: WorkspacePanelProps) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-surface)] p-8 shadow-[0_24px_80px_-40px_var(--cl-color-shadow)] backdrop-blur">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <FeatureCard
            key={bullet}
            title={bullet}
            description="Reusable placeholder content until the app gets its dedicated Step-level workflow implementation."
            detail="Shared UI foundation"
          />
        ))}
      </div>
      {footer ? (
        <div className="mt-8 text-sm text-slate-500">{footer}</div>
      ) : null}
    </section>
  );
}
