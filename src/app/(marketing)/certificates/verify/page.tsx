import type { Metadata } from "next";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Xác thực chứng chỉ", alternates: { canonical: "/certificates/verify" } };

const codeSchema = z.string().trim().regex(/^[A-Fa-f0-9]{12}$/);

type Row = { recipient_name: string; course_title: string; issued_at: string; is_revoked: boolean };

export default async function VerifyPage({ searchParams }: PageProps<"/certificates/verify">) {
  const raw = (await searchParams).code;
  const parsed = codeSchema.safeParse(Array.isArray(raw) ? raw[0] : raw);
  let result: Row | null | "invalid" | "unavailable" = null;
  if (raw !== undefined) {
    if (!parsed.success) result = "invalid";
    else {
      const supabase = await createSupabaseServerClient();
      if (!supabase) result = "unavailable";
      else {
        const { data } = await supabase.rpc("verify_certificate", { p_code: parsed.data });
        result = (data as Row[] | null)?.[0] ?? "invalid";
      }
    }
  }
  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Xác thực chứng chỉ</h1>
      <p className="mt-2 text-ink-muted">Nhập mã 12 ký tự in trên chứng chỉ để kiểm tra tính hợp lệ.</p>
      <form className="mt-6 flex gap-2" action="/certificates/verify">
        <label htmlFor="code" className="sr-only">
          Mã chứng chỉ
        </label>
        <input
          id="code"
          name="code"
          required
          defaultValue={typeof raw === "string" ? raw : ""}
          placeholder="VD: 4F2A9C1B7E3D"
          className="h-12 flex-1 rounded-xl bg-card px-4 font-mono text-[15px] uppercase ring-1 ring-line outline-none focus:ring-2 focus:ring-brand"
        />
        <button type="submit" className={buttonClass("primary", "lg")}>
          Kiểm tra
        </button>
      </form>
      <div aria-live="polite" className="mt-6">
        {result === "invalid" ? (
          <p className="flex items-center gap-2 rounded-2xl bg-danger-soft p-4 text-sm font-semibold text-danger">
            <ShieldAlert size={18} aria-hidden /> Không tìm thấy chứng chỉ với mã này.
          </p>
        ) : result === "unavailable" ? (
          <p className="rounded-2xl bg-accent-soft p-4 text-sm text-accent-ink">Chế độ phát triển: chưa kết nối cơ sở dữ liệu nên chưa thể xác thực.</p>
        ) : result ? (
          <div className={`rounded-2xl p-5 ${result.is_revoked ? "bg-danger-soft" : "bg-success-soft"}`}>
            <p className={`flex items-center gap-2 font-display font-bold ${result.is_revoked ? "text-danger" : "text-success-ink"}`}>
              {result.is_revoked ? <ShieldAlert size={20} aria-hidden /> : <BadgeCheck size={20} aria-hidden />}
              {result.is_revoked ? "Chứng chỉ đã bị thu hồi" : "Chứng chỉ hợp lệ"}
            </p>
            <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-1 text-sm text-ink">
              <dt className="text-ink-muted">Học viên</dt>
              <dd className="font-semibold">{result.recipient_name}</dd>
              <dt className="text-ink-muted">Khoá học</dt>
              <dd className="font-semibold">{result.course_title}</dd>
              <dt className="text-ink-muted">Ngày cấp</dt>
              <dd>{formatDate(result.issued_at)}</dd>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
