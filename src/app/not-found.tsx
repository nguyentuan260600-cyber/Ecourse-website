import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
        <Compass size={30} aria-hidden />
      </span>
      <p className="font-display text-sm font-bold text-brand-strong">404</p>
      <h1 className="text-3xl font-extrabold text-ink">Không tìm thấy trang</h1>
      <p className="max-w-md text-ink-muted">Trang bạn tìm có thể đã được di chuyển hoặc không tồn tại.</p>
      <div className="flex gap-2">
        <Link href="/" className={buttonClass("secondary")}>
          Về trang chủ
        </Link>
        <Link href="/courses" className={buttonClass("primary")}>
          Khám phá khoá học
        </Link>
      </div>
    </main>
  );
}
