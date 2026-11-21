"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/security/redirect";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "./schemas";

export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const NOT_CONFIGURED: AuthState = {
  status: "error",
  message: "Chế độ phát triển: chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) nên chưa thể xác thực.",
};

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  // Only trust the configured site URL in production to avoid host-header injection in emails.
  return process.env.NODE_ENV === "production" || !host ? siteConfig.url : `${proto}://${host}`;
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error.issues), values: { email } };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const unconfirmed = error.code === "email_not_confirmed";
    return {
      status: "error",
      message: unconfirmed ? "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư." : "Email hoặc mật khẩu không đúng.",
      values: { email },
    };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const values = { displayName: String(formData.get("displayName") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = registerSchema.safeParse({
    ...values,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") ?? undefined,
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error.issues), values };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    // display_name only — roles are NEVER taken from user metadata.
    options: { data: { display_name: parsed.data.displayName }, emailRedirectTo: `${await origin()}/auth/confirm?next=/dashboard` },
  });
  if (error && error.code !== "user_already_exists") {
    return { status: "error", message: error.code === "weak_password" ? "Mật khẩu quá yếu." : "Không thể đăng ký lúc này, vui lòng thử lại.", values };
  }
  // Same response whether or not the email exists (prevents account enumeration).
  return { status: "success", message: `Đã gửi email xác nhận tới ${parsed.data.email}. Vui lòng mở email để kích hoạt tài khoản.` };
}

export async function forgotPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = forgotSchema.safeParse({ email });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error.issues), values: { email } };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${await origin()}/auth/confirm?next=/reset-password` });
  return { status: "success", message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu trong vài phút." };
}

export async function resetPasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse({ password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return { status: "error", message: "Liên kết đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lần nữa." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "Không thể đổi mật khẩu. Hãy dùng mật khẩu khác với mật khẩu cũ." };
  redirect("/dashboard?password=updated");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
