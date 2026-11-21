"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart, readCart, subscribeCart } from "@/features/cart/guest-cart";
import { buttonClass } from "@/components/ui/button";

export function AddToCartButton({ slug, free }: { slug: string; free: boolean }) {
  const router = useRouter();
  const inCart = useSyncExternalStore(
    subscribeCart,
    () => readCart().includes(slug),
    () => false,
  );
  if (inCart) {
    return (
      <Link href="/cart" className={buttonClass("soft", "lg", "w-full")}>
        <Check size={18} aria-hidden /> Đã trong giỏ — xem giỏ hàng
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={buttonClass("primary", "lg", "w-full")}
      onClick={() => {
        addToCart(slug);
        toast.success("Đã thêm vào giỏ hàng", { action: { label: "Xem giỏ", onClick: () => router.push("/cart") } });
      }}
    >
      <ShoppingCart size={18} aria-hidden /> {free ? "Ghi danh miễn phí" : "Thêm vào giỏ hàng"}
    </button>
  );
}
