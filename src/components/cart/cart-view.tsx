"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { Info, ShoppingBag, Trash2 } from "lucide-react";
import { quoteCart } from "@/features/cart/actions";
import { readCart, removeFromCart, subscribeCart } from "@/features/cart/guest-cart";
import type { CartQuote } from "@/features/cart/pricing";
import { CourseThumb } from "@/components/courses/course-thumb";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVnd } from "@/lib/utils/format";

const EMPTY: string[] = [];
let cached: { raw: string; value: string[] } = { raw: "", value: EMPTY };
function snapshot() {
  const value = readCart();
  const raw = value.join("|");
  if (raw !== cached.raw) cached = { raw, value };
  return cached.value;
}

export function CartView() {
  const slugs = useSyncExternalStore(subscribeCart, snapshot, () => EMPTY);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    start(async () => setQuote(await quoteCart(slugs)));
  }, [slugs]);

  if (!quote) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }
  if (!quote.lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag size={26} aria-hidden />}
        title="Giỏ hàng đang trống"
        description="Khám phá các khoá học và thêm khoá học bạn quan tâm vào giỏ."
        action={
          <Link href="/courses" className={buttonClass("primary", "md", "mt-2")}>
            Khám phá khoá học
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]" data-pending={pending || undefined}>
      <ul className="flex flex-col gap-3">
        {quote.lines.map((l) => (
          <li key={l.slug} className="flex gap-4 rounded-3xl bg-card p-3 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
            <CourseThumb src={l.thumbnailUrl} alt="" className="aspect-[16/10] w-32 shrink-0 rounded-2xl sm:w-44" sizes="176px" />
            <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
              <Link href={`/courses/${l.slug}`} className="line-clamp-2 font-display font-bold text-ink hover:text-brand-strong">
                {l.title}
              </Link>
              <p className="text-xs text-ink-subtle">{l.instructorName}</p>
              <div className="mt-auto flex items-end justify-between gap-2">
                <div>
                  <span className="font-display text-lg font-extrabold text-ink">{l.priceVnd ? formatVnd(l.priceVnd) : "Miễn phí"}</span>
                  {l.originalPriceVnd > l.priceVnd ? <s className="ml-2 text-xs text-ink-subtle">{formatVnd(l.originalPriceVnd)}</s> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(l.slug)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-subtle hover:bg-danger-soft hover:text-danger"
                  aria-label={`Xoá ${l.title} khỏi giỏ`}
                >
                  <Trash2 size={14} aria-hidden /> Xoá
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-3xl bg-card p-6 shadow-[var(--shadow-lift)] ring-1 ring-line/60 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-bold text-ink">Tóm tắt đơn hàng</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <dt>Tạm tính ({quote.lines.length} khoá học)</dt>
            <dd>{formatVnd(quote.subtotalVnd)}</dd>
          </div>
          {quote.savingsVnd > 0 ? (
            <div className="flex justify-between text-success-ink">
              <dt>Đã tiết kiệm so với giá gốc</dt>
              <dd>{formatVnd(quote.savingsVnd)}</dd>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t border-line pt-3 font-display text-lg font-extrabold text-ink">
            <dt>Tổng cộng</dt>
            <dd>{formatVnd(quote.totalVnd)}</dd>
          </div>
        </dl>
        <button type="button" disabled className={buttonClass("primary", "lg", "mt-5 w-full")}>
          Tiến hành thanh toán
        </button>
        <p className="mt-3 flex gap-2 text-xs leading-5 text-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          Thanh toán PayOS và mã giảm giá đang được triển khai (Milestone 3). Giá trong giỏ luôn được tính lại trên máy chủ.
        </p>
      </aside>
    </div>
  );
}
