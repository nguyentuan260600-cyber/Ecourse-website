"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AuthState } from "@/features/auth/actions";
import { buttonClass } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type FieldDef = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder?: string;
  hint?: { href: string; label: string };
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  hidden,
  withTerms,
}: {
  action: (s: AuthState, f: FormData) => Promise<AuthState>;
  fields: FieldDef[];
  submitLabel: string;
  hidden?: Record<string, string>;
  withTerms?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as AuthState);
  const [show, setShow] = useState(false);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-success-soft p-6 text-center">
        <CheckCircle2 size={32} className="text-success" aria-hidden />
        <p className="text-sm font-semibold text-success-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      ) : null}
      {fields.map((f) => {
        const err = state.fieldErrors?.[f.name];
        const isPw = f.type === "password";
        return (
          <Field
            key={f.name}
            label={f.label}
            htmlFor={f.name}
            error={err}
            hint={
              f.hint ? (
                <Link href={f.hint.href} className="text-xs font-semibold text-brand-strong hover:underline">
                  {f.hint.label}
                </Link>
              ) : undefined
            }
          >
            <div className="relative">
              <input
                id={f.name}
                name={f.name}
                type={isPw && show ? "text" : f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                defaultValue={isPw ? undefined : state.values?.[f.name]}
                aria-invalid={Boolean(err)}
                aria-describedby={err ? `${f.name}-error` : undefined}
                required
                className={cn(fieldClass, isPw && "pr-11")}
              />
              {isPw ? (
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-ink-subtle hover:text-ink"
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                </button>
              ) : null}
            </div>
          </Field>
        );
      })}
      {withTerms ? (
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-muted">
            <input type="checkbox" name="acceptTerms" className="mt-0.5 h-4 w-4 accent-[var(--brand)]" aria-invalid={Boolean(state.fieldErrors?.acceptTerms)} />
            Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Khai Sáng.
          </label>
          {state.fieldErrors?.acceptTerms ? (
            <p role="alert" className="mt-1 text-sm text-danger">
              {state.fieldErrors.acceptTerms}
            </p>
          ) : null}
        </div>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-2 w-full")}>
        {pending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
        {pending ? "Đang xử lý..." : submitLabel}
      </button>
    </form>
  );
}
