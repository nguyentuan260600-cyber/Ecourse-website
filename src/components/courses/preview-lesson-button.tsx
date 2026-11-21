"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, PlayCircle, X } from "lucide-react";
import { StreamPlayer } from "./stream-player";

/** Opens a free preview lesson. The server re-checks access and returns a signed player URL. */
export function PreviewLessonButton({ lessonId, title }: { lessonId: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ url?: string; error?: string; loading: boolean }>({ loading: false });

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function openPreview() {
    setOpen(true);
    setState({ loading: true });
    try {
      const res = await fetch(`/api/lessons/${lessonId}/playback`, { cache: "no-store" });
      const body = (await res.json()) as { url?: string; error?: string };
      setState(res.ok && body.url ? { url: body.url, loading: false } : { error: body.error ?? "Không phát được video", loading: false });
    } catch {
      setState({ error: "Lỗi kết nối, vui lòng thử lại", loading: false });
    }
  }

  return (
    <>
      <button type="button" onClick={openPreview} className="rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success-ink hover:brightness-95">
        <PlayCircle size={12} className="mr-1 inline" aria-hidden />
        Học thử
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => {
          setOpen(false);
          setState({ loading: false });
        }}
        className="m-auto w-[min(960px,94vw)] overflow-hidden rounded-3xl bg-card p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <p className="truncate font-display font-semibold">{title}</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-surface-2" aria-label="Đóng">
            <X size={18} aria-hidden />
          </button>
        </div>
        {state.url ? (
          <StreamPlayer src={state.url} title={title} />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-surface-2 text-sm text-ink-muted">
            {state.loading ? <Loader2 className="animate-spin" aria-label="Đang tải video" /> : state.error}
          </div>
        )}
      </dialog>
    </>
  );
}
