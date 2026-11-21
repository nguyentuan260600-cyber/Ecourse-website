import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="ks-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d5ef7" />
          <stop offset="1" stopColor="#5442dd" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ks-g)" />
      <path d="M20 8.5l2.6 6.9 6.9 2.6-6.9 2.6L20 27.5l-2.6-6.9-6.9-2.6 6.9-2.6z" fill="#fff" />
      <circle cx="29" cy="29" r="3.2" fill="#f4b860" />
    </svg>
  );
}

export function Logo({ className, withTagline = true }: { className?: string; withTagline?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Khai Sáng — Trang chủ">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">Khai Sáng</span>
        {withTagline ? <span className="mt-0.5 hidden text-[11px] font-medium text-ink-subtle sm:block">Khai Phóng Tri Thức Số</span> : null}
      </span>
    </Link>
  );
}
