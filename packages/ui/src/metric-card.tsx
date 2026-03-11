export type MetricCardProps = {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
};

export function MetricCard({
  label,
  value,
  note,
  emphasis = false,
}: MetricCardProps) {
  return (
    <article
      className={[
        "rounded-[1.75rem] border px-5 py-5 backdrop-blur",
        emphasis
          ? "border-transparent text-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.8)]"
          : "border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] text-slate-900",
      ].join(" ")}
      style={emphasis ? { backgroundColor: "var(--app-accent)" } : undefined}
    >
      <p
        className={
          emphasis
            ? "text-xs uppercase tracking-[0.28em] text-white/70"
            : "text-xs uppercase tracking-[0.28em] text-slate-500"
        }
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {note ? (
        <p
          className={
            emphasis
              ? "mt-2 text-sm text-white/75"
              : "mt-2 text-sm text-slate-500"
          }
        >
          {note}
        </p>
      ) : null}
    </article>
  );
}
