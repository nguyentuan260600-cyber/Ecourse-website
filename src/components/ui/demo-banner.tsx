import { FlaskConical } from "lucide-react";

/** Shown whenever the catalog is served from dev fixtures instead of Supabase. */
export function DemoBanner() {
  return (
    <div role="status" className="border-b border-accent/40 bg-accent-soft text-accent-ink">
      <div className="container-page flex items-center gap-2 py-2 text-xs font-semibold">
        <FlaskConical size={14} aria-hidden />
        Chế độ phát triển: đang hiển thị dữ liệu mẫu vì chưa cấu hình Supabase. Không mua bán, không số liệu thật.
      </div>
    </div>
  );
}
