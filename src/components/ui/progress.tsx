import { cn } from "@/lib/utils/cn";

export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div className="h-full rounded-full bg-gradient-to-r from-brand-strong to-brand transition-[width] duration-500" style={{ width: `${v}%` }} />
    </div>
  );
}
