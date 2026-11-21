"use client";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("ks-theme", next);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface-2 hover:text-ink"
      aria-label="Chuyển giao diện sáng/tối"
    >
      <Sun size={19} className="hidden dark:block" aria-hidden />
      <Moon size={19} className="dark:hidden" aria-hidden />
    </button>
  );
}

/** Inline, runs before paint to avoid a theme flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('ks-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;
