"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

export function HeaderSearch() {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim();
        router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
      }}
    >
      <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle" aria-hidden />
      <input
        ref={ref}
        type="search"
        name="q"
        aria-label="Tìm kiếm khoá học"
        placeholder="Tìm kiếm khoá học, kỹ năng, giảng viên..."
        className="h-10 w-full rounded-xl bg-surface pr-12 pl-10 text-sm text-ink outline-none ring-1 ring-line/70 transition placeholder:text-ink-subtle focus:bg-card focus:ring-2 focus:ring-brand"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md bg-card px-1.5 py-0.5 font-sans text-[11px] text-ink-subtle ring-1 ring-line">
        ⌘K
      </kbd>
    </form>
  );
}
