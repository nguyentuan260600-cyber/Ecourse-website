import { cn } from "@/lib/utils/cn";
import { discountPercent, formatVnd } from "@/lib/utils/format";

export function Price({ price, compareAt, size = "md", className }: { price: number; compareAt: number | null; size?: "md" | "lg"; className?: string }) {
  const pct = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-display font-extrabold tracking-tight text-ink", size === "lg" ? "text-4xl" : "text-xl")}>
        {price === 0 ? "Miễn phí" : formatVnd(price)}
      </span>
      {pct > 0 && compareAt ? (
        <>
          <s className="text-xs text-ink-subtle">
            <span className="sr-only">Giá gốc </span>
            {formatVnd(compareAt)}
          </s>
          <span className="text-xs font-bold text-danger">-{pct}%</span>
        </>
      ) : null}
    </div>
  );
}
