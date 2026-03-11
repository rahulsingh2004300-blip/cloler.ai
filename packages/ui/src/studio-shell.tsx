import type { ReactNode } from "react";
import { ActionLink } from "./action-link";
import { MetricCard, type MetricCardProps } from "./metric-card";

export type StudioAction = {
  href: string;
  label: string;
  caption: string;
  variant?: "primary" | "secondary";
};

export type StudioShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  pills?: string[];
  actions: StudioAction[];
  metrics: MetricCardProps[];
  spotlight?: ReactNode;
  footnote?: ReactNode;
  children: ReactNode;
};

export function StudioShell({
  eyebrow,
  title,
  description,
  pills,
  actions,
  metrics,
  spotlight,
  footnote,
  children,
}: StudioShellProps) {
  return (
    <main className="relative isolate overflow-hidden px-6 py-10 sm:px-10 lg:px-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem]"
        style={{
          background:
            "radial-gradient(circle at top left, var(--app-accent-soft), transparent 34%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.55), transparent 16%)",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2.2rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-surface)] px-6 py-7 shadow-[0_28px_90px_-48px_var(--cl-color-shadow)] backdrop-blur sm:px-8 sm:py-8">
            <div className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              {eyebrow}
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {description}
            </p>
            {pills?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[color:var(--cl-color-line)] bg-white/65 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-600"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <ActionLink key={action.label} {...action} />
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
            {footnote ? (
              <div className="mt-8 text-sm text-slate-500">{footnote}</div>
            ) : null}
          </article>
          <div className="grid gap-4">
            {spotlight ?? (
              <MetricCard
                label="System"
                value="Ready"
                note="Shared UI foundation is active across the full workspace."
                emphasis
              />
            )}
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">{children}</section>
      </div>
    </main>
  );
}
