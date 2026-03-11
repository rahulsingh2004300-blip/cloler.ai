import type { TextareaHTMLAttributes } from "react";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function TextArea({ label, hint, className, ...props }: TextAreaProps) {
  return (
    <label className="grid gap-2">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <textarea
        className={[
          "min-h-28 rounded-md border border-[color:var(--cl-color-line)] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
          className ?? "",
        ].join(" ")}
        {...props}
      />
      {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
    </label>
  );
}
