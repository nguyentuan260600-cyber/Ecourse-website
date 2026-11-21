import Link from "next/link";
import { Suspense } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { mainNav } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSearch } from "./header-search";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

const iconBtn = "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface-2 hover:text-ink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white">
        Bỏ qua điều hướng
      </a>
      <div className="container-page flex h-[72px] items-center gap-2 sm:gap-4">
        <Logo className="shrink-0" />
        <nav aria-label="Điều hướng chính" className="ml-2 hidden items-center gap-0.5 xl:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 font-display text-sm font-semibold whitespace-nowrap text-ink-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mx-2 hidden max-w-sm flex-1 md:block">
          <HeaderSearch />
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Link href="/wishlist" className={`${iconBtn} hidden sm:inline-flex`} aria-label="Danh sách yêu thích">
            <Heart size={20} aria-hidden />
          </Link>
          <Link href="/cart" className={iconBtn} aria-label="Giỏ hàng">
            <ShoppingBag size={20} aria-hidden />
          </Link>
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />
          <Suspense fallback={<Skeleton className="h-9 w-24" />}>
            <UserMenu />
          </Suspense>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
