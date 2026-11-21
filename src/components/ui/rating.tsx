import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "@/lib/utils/format";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? "fill-accent text-accent" : "fill-surface-3 text-surface-3"}
        />
      ))}
    </span>
  );
}

export function RatingInline({ value, count, className }: { value: number; count?: number; className?: string }) {
  if (!value) return <span className={cn("text-xs text-ink-subtle", className)}>Chưa có đánh giá</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-ink", className)}>
      <Star width={14} height={14} className="fill-accent text-accent" aria-hidden />
      <span>{value.toFixed(value % 1 === 0 ? 1 : 2).replace(/0$/, "")}</span>
      {count !== undefined ? <span className="font-normal text-ink-subtle">({formatCount(count)})</span> : null}
      <span className="sr-only">trên 5 sao</span>
    </span>
  );
}
