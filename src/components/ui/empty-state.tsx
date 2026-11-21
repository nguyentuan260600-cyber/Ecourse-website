import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-card/60 px-6 py-14 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">{icon}</div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}
