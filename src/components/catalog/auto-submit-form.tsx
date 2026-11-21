"use client";
import { useRouter } from "next/navigation";
import { useRef, useTransition, type ReactNode } from "react";

/**
 * A GET form that also works without JavaScript. With JS, any change re-runs the
 * search (resetting to page 1) via client navigation.
 */
export function AutoSubmitForm({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  function navigate() {
    const form = ref.current;
    if (!form) return;
    const data = new FormData(form);
    const p = new URLSearchParams();
    const multi = new Map<string, string[]>();
    for (const [k, v] of data.entries()) {
      const val = String(v);
      if (!val) continue;
      if (k === "level" || k === "duration") multi.set(k, [...(multi.get(k) ?? []), val]);
      else p.set(k, val);
    }
    for (const [k, vs] of multi) p.set(k, vs.join(","));
    if (p.get("maxPrice") === "5000000") p.delete("maxPrice");
    if (p.get("sort") === "popular") p.delete("sort");
    p.delete("page");
    const s = p.toString();
    start(() => router.push(s ? `/courses?${s}` : "/courses", { scroll: false }));
  }

  return (
    <form
      ref={ref}
      action="/courses"
      method="get"
      className={className}
      data-pending={pending || undefined}
      onChange={(e) => {
        if ((e.target as HTMLElement).dataset.noauto !== undefined) return;
        navigate();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        navigate();
      }}
    >
      {children}
    </form>
  );
}
