import type { CSSProperties } from "react";

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  const eyebrowStyle: CSSProperties = {
    backgroundColor: "var(--app-accent-soft)",
    color: "var(--app-accent)",
  };

  return (
    <header>
      <div
        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
        style={eyebrowStyle}
      >
        {eyebrow}
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </header>
  );
}
