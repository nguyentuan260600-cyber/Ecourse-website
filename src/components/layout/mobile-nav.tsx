"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav({ nav }: { nav: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // close on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-surface-2 xl:hidden"
        aria-label="Mở menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={22} aria-hidden />
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-0 ml-auto h-dvh max-h-none w-[86vw] max-w-sm bg-card p-0 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-display text-lg font-bold">
              Menu <ThemeToggle />
            </span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-surface-2" aria-label="Đóng menu">
              <X size={20} aria-hidden />
            </button>
          </div>
          <form action="/courses" className="relative">
            <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input
              name="q"
              type="search"
              placeholder="Tìm khoá học, kỹ năng..."
              aria-label="Tìm kiếm khoá học"
              className="h-11 w-full rounded-xl bg-surface pr-3 pl-10 text-[15px] outline-none ring-1 ring-line focus:ring-2 focus:ring-brand"
            />
          </form>
          <nav aria-label="Điều hướng chính">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-xl px-3 py-3 font-display font-semibold hover:bg-surface-2">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" className="block rounded-xl px-3 py-3 font-display font-semibold hover:bg-surface-2">
                  Giỏ hàng
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
