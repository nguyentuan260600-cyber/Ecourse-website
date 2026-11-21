import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Đăng ký", robots: { index: false } };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Tạo tài khoản</h1>
      <p className="mt-2 mb-8 text-ink-muted">Miễn phí, chỉ mất 30 giây.</p>
      <AuthForm
        action={registerAction}
        submitLabel="Đăng ký"
        withTerms
        fields={[
          { name: "displayName", label: "Họ và tên", type: "text", autoComplete: "name", placeholder: "Nguyễn Văn An" },
          { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "ban@email.com" },
          { name: "password", label: "Mật khẩu", type: "password", autoComplete: "new-password", placeholder: "Tối thiểu 8 ký tự, có chữ và số" },
          { name: "confirmPassword", label: "Nhập lại mật khẩu", type: "password", autoComplete: "new-password" },
        ]}
      />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-brand-strong hover:underline">
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
