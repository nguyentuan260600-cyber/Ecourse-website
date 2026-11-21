"use client";
import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** One filter panel for all breakpoints (avoids duplicate inputs in the form). */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="filter-panel"
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-card font-display text-sm font-semibold text-ink ring-1 ring-line lg:hidden"
      >
        <SlidersHorizontal size={16} aria-hidden /> {open ? "Ẩn bộ lọc" : "Hiện bộ lọc"} {activeCount ? `(${activeCount})` : ""}
      </button>
      <div id="filter-panel" className={cn("lg:sticky lg:top-24 lg:block", open ? "block" : "hidden")}>
        {children}
      </div>
    </>
  );
}
