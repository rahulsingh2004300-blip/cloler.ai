export type ActionLinkProps = {
  href: string;
  label: string;
  caption: string;
  variant?: "primary" | "secondary";
};

export function ActionLink({
  href,
  label,
  caption,
  variant = "primary",
}: ActionLinkProps) {
  const isPrimary = variant === "primary";

  return (
    <a
      href={href}
      className={[
        "min-w-[13rem] rounded-xl border px-4 py-3 transition-colors",
        isPrimary
          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
          : "border-[color:var(--cl-color-line)] bg-white text-slate-900 hover:bg-slate-50",
      ].join(" ")}
    >
      <p className="text-sm font-medium">{label}</p>
      <p
        className={
          isPrimary
            ? "mt-1 text-sm text-slate-300"
            : "mt-1 text-sm text-slate-500"
        }
      >
        {caption}
      </p>
    </a>
  );
}
