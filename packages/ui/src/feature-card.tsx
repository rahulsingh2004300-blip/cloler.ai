export type FeatureCardProps = {
  title: string;
  description: string;
  detail: string;
  tone?: "neutral" | "accent" | "warm";
};

export function FeatureCard({
  title,
  description,
  detail,
  tone = "neutral",
}: FeatureCardProps) {
  const classes = {
    neutral: "border-[color:var(--cl-color-line)] bg-white",
    accent: "border-slate-300 bg-slate-50",
    warm: "border-amber-200 bg-amber-50/70",
  };

  return (
    <article
      className={["rounded-xl border p-5 shadow-sm", classes[tone]].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {detail}
      </p>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
