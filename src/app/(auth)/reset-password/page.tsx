import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { resetPasswordAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Đặt lại mật khẩu", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Đặt mật khẩu mới</h1>
      <p className="mt-2 mb-8 text-ink-muted">Mật khẩu tối thiểu 8 ký tự, gồm chữ và số.</p>
      <AuthForm
        action={resetPasswordAction}
        submitLabel="Cập nhật mật khẩu"
        fields={[
          { name: "password", label: "Mật khẩu mới", type: "password", autoComplete: "new-password" },
          { name: "confirmPassword", label: "Nhập lại mật khẩu", type: "password", autoComplete: "new-password" },
        ]}
      />
    </>
  );
}
