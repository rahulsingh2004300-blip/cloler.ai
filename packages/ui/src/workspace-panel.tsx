import type { ReactNode } from "react";
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
    <section className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <ul className="mt-5 space-y-3 text-sm text-slate-600">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="rounded-lg border border-[color:var(--cl-color-line)] bg-slate-50 px-4 py-3"
          >
            {bullet}
          </li>
        ))}
      </ul>
      {footer ? (
        <div className="mt-5 text-sm text-slate-500">{footer}</div>
      ) : null}
    </section>
  );
}
