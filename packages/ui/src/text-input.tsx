import type { InputHTMLAttributes } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function TextInput({
  label,
  hint,
  className,
  ...props
}: TextInputProps) {
  return (
    <label className="grid gap-2">
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
      ) : null}
      <input
        className={[
          "min-h-11 rounded-[1rem] border border-[color:var(--cl-color-line)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-[color:var(--app-accent-soft)]",
          className ?? "",
        ].join(" ")}
        {...props}
      />
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
    </label>
  );
}
