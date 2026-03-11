import type { ButtonHTMLAttributes, CSSProperties } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  className,
  tone = "primary",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  const isPrimary = tone === "primary";
  const style: CSSProperties | undefined = isPrimary
    ? { backgroundColor: "var(--app-accent)", color: "#ffffff" }
    : undefined;

  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
        fullWidth ? "w-full" : "",
        tone === "secondary"
          ? "border border-[color:var(--cl-color-line)] bg-white/80 text-slate-900 hover:bg-white"
          : "",
        tone === "ghost" ? "text-slate-700 hover:bg-white/70" : "",
        isPrimary
          ? "border border-transparent shadow-[0_18px_44px_-30px_rgba(15,23,42,0.6)] hover:brightness-[1.04]"
          : "",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className ?? "",
      ].join(" ")}
      style={style}
      {...props}
    />
  );
}
