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
    neutral:
      "border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] text-slate-900",
    accent:
      "border-transparent text-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.7)]",
    warm: "border-[#f4d7a7] bg-[#fff6e8] text-slate-900",
  };

  return (
    <article
      className={[
        "rounded-[1.8rem] border px-5 py-5 backdrop-blur transition-transform duration-200 hover:-translate-y-1",
        classes[tone],
      ].join(" ")}
      style={
        tone === "accent" ? { backgroundColor: "var(--app-accent)" } : undefined
      }
    >
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p
        className={
          tone === "accent"
            ? "mt-3 text-sm leading-6 text-white/80"
            : "mt-3 text-sm leading-6 text-slate-600"
        }
      >
        {description}
      </p>
      <p
        className={
          tone === "accent"
            ? "mt-6 text-xs uppercase tracking-[0.24em] text-white/65"
            : "mt-6 text-xs uppercase tracking-[0.24em] text-slate-500"
        }
      >
        {detail}
      </p>
    </article>
  );
}
