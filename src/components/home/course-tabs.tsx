"use client";
import { useId, useState } from "react";
import type { CourseSummary } from "@/features/courses/types";
import { cn } from "@/lib/utils/cn";

export type CourseTab = { key: string; label: string; items: CourseSummary[] };

/** Accessible tablist; card markup is rendered on the server and passed in. */
export function CourseTabs({ tabs, renderPanels }: { tabs: { key: string; label: string }[]; renderPanels: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const id = useId();
  return (
    <div>
      <div role="tablist" aria-label="Lọc khoá học" className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-card p-1.5 ring-1 ring-line/60 sm:inline-flex">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            id={`${id}-tab-${t.key}`}
            aria-selected={active === t.key}
            aria-controls={`${id}-panel-${t.key}`}
            tabIndex={active === t.key ? 0 : -1}
            onClick={() => setActive(t.key)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
              setActive(next.key);
              document.getElementById(`${id}-tab-${next.key}`)?.focus();
            }}
            className={cn(
              "rounded-xl px-4 py-2 font-display text-sm font-semibold whitespace-nowrap transition",
              active === t.key ? "bg-brand-soft text-brand-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`${id}-panel-${t.key}`} aria-labelledby={`${id}-tab-${t.key}`} hidden={active !== t.key}>
          {renderPanels[t.key]}
        </div>
      ))}
    </div>
  );
}
