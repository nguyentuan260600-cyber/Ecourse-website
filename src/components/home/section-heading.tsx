import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  icon,
  title,
  description,
  align = "split",
  action,
  className,
}: {
  eyebrow: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  align?: "split" | "center";
  action?: ReactNode;
  className?: string;
}) {
  if (align === "center") {
    return (
      <div className={cn("mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center", className)}>
        <span className="rounded-full bg-brand-soft px-3 py-1 font-display text-[11px] font-bold tracking-wider text-brand-ink uppercase">{eyebrow}</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-[40px] sm:leading-[1.15]">{title}</h2>
        {description ? <p className="text-ink-muted">{description}</p> : null}
      </div>
    );
  }
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end", className)}>
      <div className="flex flex-col gap-2">
        <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      </div>
      {description || action ? (
        <div className="flex max-w-md flex-col gap-3 md:items-end md:text-right">
          {description ? <p className="text-ink-muted">{description}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
