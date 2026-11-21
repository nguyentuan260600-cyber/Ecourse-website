import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

describe("auth schemas", () => {
  it("normalizes email", () => {
    expect(loginSchema.parse({ email: "An@Example.COM", password: "x" }).email).toBe("an@example.com");
  });
  it("requires strong matching passwords and terms", () => {
    const base = { displayName: "Nguyễn An", email: "a@b.vn", password: "matkhau123", confirmPassword: "matkhau123", acceptTerms: "on" };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, password: "short1", confirmPassword: "short1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "khongcoso", confirmPassword: "khongcoso" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirmPassword: "khac12345" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, acceptTerms: undefined }).success).toBe(false);
  });
});
