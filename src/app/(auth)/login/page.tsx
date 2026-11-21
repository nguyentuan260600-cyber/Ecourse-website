import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/features/auth/actions";
import { safeNextPath } from "@/lib/security/redirect";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Chào mừng trở lại</h1>
      <p className="mt-2 mb-8 text-ink-muted">Đăng nhập để tiếp tục học.</p>
      {sp.error === "link" ? (
        <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Liên kết không hợp lệ hoặc đã hết hạn.
        </p>
      ) : null}
      <AuthForm
        action={loginAction}
        submitLabel="Đăng nhập"
        hidden={{ next }}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "ban@email.com" },
          { name: "password", label: "Mật khẩu", type: "password", autoComplete: "current-password", hint: { href: "/forgot-password", label: "Quên mật khẩu?" } },
        ]}
      />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Chưa có tài khoản?{" "}
        <Link href={`/register${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-strong hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
}
