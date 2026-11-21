import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-brand text-white shadow-[var(--shadow-brand)] hover:bg-brand-hover",
  secondary: "bg-card text-ink shadow-[var(--shadow-soft)] ring-1 ring-line hover:bg-surface",
  soft: "bg-brand-soft text-brand-ink hover:bg-surface-3",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  accent: "bg-accent text-[#291800] hover:brightness-95",
  danger: "bg-danger text-white hover:brightness-95",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-6 text-[15px] gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-display font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children?: ReactNode };

export function Button({ variant, size, className, type = "button", ...props }: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
