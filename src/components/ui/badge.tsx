import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  brand: "bg-brand-soft text-brand-ink",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-success-soft text-success-ink",
  neutral: "bg-surface-2 text-ink-muted",
  danger: "bg-danger-soft text-danger",
  solid: "bg-brand text-white",
  dark: "bg-ink/80 text-white backdrop-blur",
} as const;

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold tracking-wide whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-display text-xs font-bold tracking-[0.08em] text-brand-strong uppercase", className)}>
      {icon}
      <span>{children}</span>
    </div>
  );
}
