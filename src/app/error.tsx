"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function GlobalSegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook for Sentry-compatible monitoring (Milestone 6). Never render error.message to users.
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle size={30} aria-hidden />
      </span>
      <h1 className="text-2xl font-extrabold text-ink">Đã có lỗi xảy ra</h1>
      <p className="max-w-md text-ink-muted">Vui lòng thử lại. Nếu lỗi tiếp diễn, hãy liên hệ hỗ trợ{error.digest ? ` với mã ${error.digest}` : ""}.</p>
      <button type="button" onClick={reset} className={buttonClass("primary")}>
        Thử lại
      </button>
    </main>
  );
}
