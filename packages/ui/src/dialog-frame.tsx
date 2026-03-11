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
    <section className="rounded-[1.8rem] border border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] p-5 shadow-[0_20px_70px_-42px_var(--cl-color-shadow)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
      {footer ? (
        <div className="mt-5 text-sm text-slate-500">{footer}</div>
      ) : null}
    </section>
  );
}
