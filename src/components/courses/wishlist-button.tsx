"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlist } from "@/features/wishlist/actions";
import { cn } from "@/lib/utils/cn";

export function WishlistButton({ courseId, courseTitle, className }: { courseId: string; courseTitle: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `Bỏ "${courseTitle}" khỏi yêu thích` : `Lưu "${courseTitle}" vào yêu thích`}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await toggleWishlist(courseId);
          if (res.ok) {
            setSaved(res.saved);
            toast.success(res.saved ? "Đã lưu vào danh sách yêu thích" : "Đã bỏ khỏi danh sách yêu thích");
          } else if (res.reason === "auth") {
            router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
          } else if (res.reason === "demo") {
            toast.info("Chế độ dữ liệu mẫu: cần cấu hình Supabase để lưu yêu thích.");
          } else {
            toast.error("Không thể cập nhật, vui lòng thử lại.");
          }
        });
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition hover:scale-105",
        className,
      )}
    >
      <Heart size={17} className={saved ? "fill-danger text-danger" : ""} aria-hidden />
    </button>
  );
}
