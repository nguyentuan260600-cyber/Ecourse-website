import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Giỏ hàng", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-ink">Giỏ hàng của bạn</h1>
      <CartView />
    </div>
  );
}
