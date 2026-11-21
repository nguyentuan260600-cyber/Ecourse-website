import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Film, RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/admin/copy-button";
import { VideoUploader } from "@/components/admin/video-uploader";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/features/auth/session";
import { isStreamConfigured, listVideos, type StreamVideo } from "@/lib/cloudflare/stream";
import { formatClock, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Thư viện video", robots: { index: false } };

const STATE: Record<StreamVideo["state"], { label: string; tone: "success" | "accent" | "danger" | "neutral" }> = {
  ready: { label: "Sẵn sàng", tone: "success" },
  pendingupload: { label: "Chờ tải lên", tone: "neutral" },
  downloading: { label: "Đang nhận tệp", tone: "accent" },
  queued: { label: "Đang xếp hàng", tone: "accent" },
  inprogress: { label: "Đang xử lý", tone: "accent" },
  error: { label: "Lỗi", tone: "danger" },
  "live-inprogress": { label: "Đang phát trực tiếp", tone: "accent" },
};

export default async function AdminVideosPage() {
  await requireRole(["admin", "instructor"], "/admin/videos");

  let videos: StreamVideo[] = [];
  let loadError = "";
  if (isStreamConfigured) {
    try {
      videos = await listVideos(100);
    } catch {
      loadError = "Không tải được danh sách video từ Cloudflare. Kiểm tra Account ID và API token.";
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">Quản trị</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Thư viện video</h1>
          <p className="mt-1 text-ink-muted">Video lưu trên Cloudflare Stream, chỉ phát được bằng liên kết có chữ ký do máy chủ cấp.</p>
        </div>
        <Link href="/admin/videos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong hover:underline">
          <RefreshCw size={15} aria-hidden /> Làm mới trạng thái
        </Link>
      </div>

      {!isStreamConfigured ? (
        <div className="rounded-3xl bg-accent-soft p-6 text-accent-ink">
          <p className="flex items-center gap-2 font-display font-bold">
            <AlertTriangle size={18} aria-hidden /> Chưa kết nối Cloudflare Stream
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            <li>Cloudflare Dashboard → Stream: bật Stream cho tài khoản.</li>
            <li>
              My Profile → API Tokens → Create Token → Custom token, quyền <strong>Account › Stream › Edit</strong>.
            </li>
            <li>
              Thêm vào <code>.env.local</code>: <code>CLOUDFLARE_ACCOUNT_ID</code> và <code>CLOUDFLARE_STREAM_API_TOKEN</code>, rồi khởi động lại máy chủ.
            </li>
          </ol>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <section aria-labelledby="upload-title">
            <h2 id="upload-title" className="mb-3 text-lg font-bold text-ink">
              Tải video mới
            </h2>
            <VideoUploader />
            <div className="mt-4 rounded-2xl bg-surface p-4 text-sm leading-6 text-ink-muted">
              <p className="font-semibold text-ink">Gắn video vào bài học</p>
              Khi video ở trạng thái <strong>Sẵn sàng</strong>, sao chép UID và dán vào cột <code>video_uid</code> của bảng{" "}
              <code>lessons</code> (hoặc <code>preview_video_uid</code> của <code>courses</code> cho video giới thiệu) trong Supabase.
            </div>
          </section>

          <section aria-labelledby="library-title">
            <h2 id="library-title" className="mb-3 text-lg font-bold text-ink">
              Video đã tải ({videos.length})
            </h2>
            {loadError ? <p className="mb-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{loadError}</p> : null}
            {videos.length ? (
              <ul className="flex flex-col gap-3">
                {videos.map((v) => (
                  <li key={v.uid} className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-line/60 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-subtle">
                      <Film size={22} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-semibold text-ink">{v.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
                        <Badge tone={STATE[v.state].tone}>
                          {STATE[v.state].label}
                          {v.state === "inprogress" && v.pctComplete !== null ? ` ${v.pctComplete.toFixed(0)}%` : ""}
                        </Badge>
                        {v.durationSeconds ? <span>{formatClock(v.durationSeconds)}</span> : null}
                        {v.created ? <span>{formatDate(v.created)}</span> : null}
                        {!v.requireSignedURLs ? <span className="font-semibold text-danger">Chưa bật bảo vệ chữ ký</span> : null}
                      </p>
                      {v.errorText ? <p className="mt-1 text-xs text-danger">{v.errorText}</p> : null}
                      <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                        {v.uid} <CopyButton value={v.uid} label="Sao chép UID" />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : !loadError ? (
              <EmptyState icon={<Film size={26} aria-hidden />} title="Chưa có video" description="Video bạn tải lên sẽ xuất hiện tại đây." />
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
