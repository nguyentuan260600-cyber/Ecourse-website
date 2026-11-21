import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const item = "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 font-display text-sm font-semibold transition";
  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-ink-muted">
        Trang <strong className="text-ink">{page}</strong> trên <strong className="text-ink">{pageCount}</strong>
      </p>
      <ul className="flex items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={cn(item, "gap-1 bg-card ring-1 ring-line hover:bg-surface")} rel="prev">
              <ChevronLeft size={16} aria-hidden /> Trước
            </Link>
          ) : (
            <span className={cn(item, "gap-1 text-ink-subtle")} aria-disabled>
              <ChevronLeft size={16} aria-hidden /> Trước
            </span>
          )}
        </li>
        {pages(page, pageCount).map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === "…" ? (
              <span className={cn(item, "text-ink-subtle")}>…</span>
            ) : (
              <Link
                href={hrefFor(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(item, p === page ? "bg-brand text-white shadow-[var(--shadow-brand)]" : "text-ink-muted hover:bg-surface-2")}
              >
                {p}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} className={cn(item, "gap-1 bg-card ring-1 ring-line hover:bg-surface")} rel="next">
              Tiếp <ChevronRight size={16} aria-hidden />
            </Link>
          ) : (
            <span className={cn(item, "gap-1 text-ink-subtle")} aria-disabled>
              Tiếp <ChevronRight size={16} aria-hidden />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
