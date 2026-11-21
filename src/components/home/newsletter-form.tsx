"use client";
import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/features/newsletter/actions";
import { cn } from "@/lib/utils/cn";

const initial: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className={cn("flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}>
        <label htmlFor={compact ? "nl-email-footer" : "nl-email"} className="sr-only">
          Email của bạn
        </label>
        <input
          id={compact ? "nl-email-footer" : "nl-email"}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Nhập email của bạn..."
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl px-4 text-sm outline-none transition focus:ring-2",
            dark
              ? "bg-white/15 text-white placeholder:text-white/70 ring-1 ring-white/25 focus:ring-white"
              : "bg-surface text-ink ring-1 ring-line placeholder:text-ink-subtle focus:ring-brand",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-11 shrink-0 rounded-xl px-5 font-display text-sm font-bold transition disabled:opacity-60",
            dark ? "bg-accent text-[#291800] hover:brightness-95" : "bg-brand text-white hover:bg-brand-hover",
          )}
        >
          {pending ? "Đang gửi..." : compact ? "Đăng ký" : "Nhận lộ trình miễn phí"}
        </button>
      </div>
      <p aria-live="polite" className={cn("min-h-5 text-xs", state.status === "error" ? (dark ? "text-accent-soft" : "text-danger") : dark ? "text-white/90" : "text-success-ink")}>
        {state.message}
      </p>
    </form>
  );
}
