import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-3xl bg-card shadow-[var(--shadow-soft)] ring-1 ring-line/60", className)} {...props} />;
}
