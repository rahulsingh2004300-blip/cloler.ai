import type { ReactNode } from "react";

export type DialogFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function DialogFrame({
  eyebrow,
  title,
  description,
  children,
  footer,
}: DialogFrameProps) {
  return (
    <section className="rounded-xl border border-[color:var(--cl-color-line)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
      {footer ? (
        <div className="mt-4 text-sm text-slate-500">{footer}</div>
      ) : null}
    </section>
  );
}
