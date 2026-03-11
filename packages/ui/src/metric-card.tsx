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
        "rounded-xl border p-5 shadow-sm",
        emphasis
          ? "border-slate-300 bg-slate-50 text-slate-950"
          : "border-[color:var(--cl-color-line)] bg-[color:var(--cl-color-card)] text-slate-900",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
    </article>
  );
}
