import type { CSSProperties } from "react";

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
  const style: CSSProperties | undefined = isPrimary
    ? {
        backgroundColor: "var(--app-accent)",
        color: "#ffffff",
      }
    : undefined;

  return (
    <a
      href={href}
      className={[
        "group flex min-h-[5.5rem] flex-col justify-between rounded-[1.6rem] border px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5",
        isPrimary
          ? "border-transparent shadow-[0_24px_60px_-36px_rgba(15,23,42,0.7)]"
          : "border-[color:var(--cl-color-line)] bg-white/70 text-slate-900",
      ].join(" ")}
      style={style}
    >
      <span className="text-base font-semibold tracking-tight">{label}</span>
      <span
        className={
          isPrimary ? "text-sm text-white/78" : "text-sm text-slate-500"
        }
      >
        {caption}
      </span>
    </a>
  );
}
