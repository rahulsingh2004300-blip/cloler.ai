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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="rounded-2xl border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-surface)] p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
            {pills?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[color:var(--cl-color-line)] bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {actions.map((action) => (
                <ActionLink key={action.label} {...action} />
              ))}
            </div>
          </article>
          <aside className="rounded-2xl border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-surface)] p-6 shadow-sm">
            {spotlight ?? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Status
                </p>
                <h2 className="text-xl font-semibold text-slate-950">
                  Shared foundation ready
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  This surface is intentionally minimal until the app-specific
                  workflows are implemented.
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        {footnote ? (
          <div className="mt-4 text-sm text-slate-500">{footnote}</div>
        ) : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-3">{children}</section>
      </div>
    </main>
  );
}
