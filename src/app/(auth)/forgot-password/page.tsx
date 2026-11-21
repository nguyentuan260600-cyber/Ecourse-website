import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { forgotPasswordAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Quên mật khẩu", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Quên mật khẩu?</h1>
      <p className="mt-2 mb-8 text-ink-muted">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
      <AuthForm action={forgotPasswordAction} submitLabel="Gửi liên kết" fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]} />
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-strong hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </>
  );
}
