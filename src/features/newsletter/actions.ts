"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NewsletterState = { status: "idle" | "success" | "error"; message: string };

const schema = z.object({ email: z.email("Email không hợp lệ").max(254) });

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase() });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Email không hợp lệ" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Chế độ phát triển: chưa cấu hình Supabase nên chưa lưu đăng ký." };
  }
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });
  // Duplicate email → same success message (no account enumeration).
  if (error && error.code !== "23505") return { status: "error", message: "Không thể đăng ký lúc này, vui lòng thử lại." };
  return { status: "success", message: "Đã đăng ký! Hãy kiểm tra hộp thư của bạn." };
}
