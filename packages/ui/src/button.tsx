import type { ButtonHTMLAttributes } from "react";

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
  return (
    <button
      type={type}
      className={[
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
        fullWidth ? "w-full" : "",
        tone === "primary" ? "bg-slate-900 text-white hover:bg-slate-800" : "",
        tone === "secondary"
          ? "border border-[color:var(--cl-color-line)] bg-white text-slate-900 hover:bg-slate-50"
          : "",
        tone === "ghost" ? "text-slate-700 hover:bg-slate-100" : "",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
