import { z } from "zod";

export const emailSchema = z.email("Email không hợp lệ").max(254).transform((s) => s.toLowerCase());
export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .max(72, "Mật khẩu tối đa 72 ký tự")
  .regex(/[A-Za-z]/, "Mật khẩu cần có chữ cái")
  .regex(/[0-9]/, "Mật khẩu cần có chữ số");

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Vui lòng nhập mật khẩu").max(72) });

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal("on", { error: "Bạn cần đồng ý với điều khoản" }),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Mật khẩu nhập lại không khớp" });

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Mật khẩu nhập lại không khớp" });
