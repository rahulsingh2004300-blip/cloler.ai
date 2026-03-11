import { ReactNode } from "react";

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
    <section className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mb-4 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
        {eyebrow}
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
          >
            {bullet}
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-8">{footer}</div> : null}
    </section>
  );
}
