import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const fieldClass =
  "w-full rounded-xl bg-card px-4 h-11 text-[15px] text-ink placeholder:text-ink-subtle ring-1 ring-line shadow-[var(--shadow-soft)] outline-none transition focus:ring-2 focus:ring-brand aria-[invalid=true]:ring-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldClass, "appearance-none pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%23787586%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="font-display text-sm font-semibold text-ink">
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
