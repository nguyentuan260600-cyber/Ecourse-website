"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CheckCircle2, Pause, Play, UploadCloud, X } from "lucide-react";
import { Upload } from "tus-js-client";
import { toast } from "sonner";
import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Phase = "idle" | "uploading" | "paused" | "done" | "error";

export function VideoUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<Upload | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [uid, setUid] = useState<string | null>(null);

  function start() {
    if (!file) return;
    setError("");
    setPhase("uploading");
    setPct(0);
    const upload = new Upload(file, {
      endpoint: "/api/admin/stream/tus", // our server creates the slot; bytes go to Cloudflare
      chunkSize: 50 * 1024 * 1024, // Cloudflare requires multiples of 256 KiB, min 5 MB
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: { name: name.trim() || file.name, filetype: file.type },
      onAfterResponse(_req, res) {
        const id = res.getHeader("stream-media-id");
        if (id) setUid(id);
      },
      onProgress(sent, total) {
        setPct(total ? (sent / total) * 100 : 0);
      },
      onError(err) {
        setPhase("error");
        const msg = String(err?.message ?? err);
        setError(msg.includes("403") ? "Bạn không có quyền tải video." : msg.includes("503") ? "Cloudflare Stream chưa được cấu hình." : "Tải lên thất bại. Bạn có thể bấm Tiếp tục để thử lại.");
      },
      onSuccess() {
        setPhase("done");
        setPct(100);
        toast.success("Đã tải lên. Cloudflare đang xử lý video (vài phút).");
        router.refresh();
      },
    });
    uploadRef.current = upload;
    upload.findPreviousUploads().then((prev) => {
      if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
      upload.start();
    });
  }

  function reset() {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setFile(null);
    setName("");
    setPhase("idle");
    setPct(0);
    setUid(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
      <label
        htmlFor="video-file"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-surface px-6 py-10 text-center transition hover:border-brand"
      >
        <UploadCloud size={32} className="text-brand" aria-hidden />
        <span className="font-display font-semibold text-ink">{file ? file.name : "Chọn tệp video để tải lên"}</span>
        <span className="text-xs text-ink-subtle">
          {file ? `${(file.size / 1024 ** 2).toFixed(1)} MB` : "MP4, MOV, MKV, WebM… tối đa 30 GB. Tải lên có thể tiếp tục nếu bị gián đoạn."}
        </span>
        <input
          ref={inputRef}
          id="video-file"
          type="file"
          accept="video/*"
          className="sr-only"
          disabled={phase === "uploading"}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
            setPhase("idle");
            setPct(0);
            setUid(null);
          }}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="video-name" className="font-display text-sm font-semibold text-ink">
          Tên video (để bạn dễ tìm)
        </label>
        <input
          id="video-name"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
          disabled={phase === "uploading"}
          placeholder="VD: Bài 1.1 — Giới thiệu khoá học"
          className="h-11 rounded-xl bg-surface px-4 text-[15px] text-ink ring-1 ring-line outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {phase !== "idle" ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          <Progress value={pct} label="Tiến độ tải lên" />
          <p className="text-sm text-ink-muted">
            {phase === "done" ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-success-ink">
                <CheckCircle2 size={16} aria-hidden /> Hoàn tất{uid ? ` — UID: ${uid}` : ""}
              </span>
            ) : phase === "paused" ? (
              `Đã tạm dừng ở ${pct.toFixed(0)}%`
            ) : phase === "error" ? (
              <span className="text-danger">{error}</span>
            ) : (
              `Đang tải lên… ${pct.toFixed(1)}%`
            )}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {phase === "idle" || phase === "done" ? (
          <button type="button" disabled={!file || phase === "done"} onClick={start} className={buttonClass("primary")}>
            <UploadCloud size={18} aria-hidden /> Tải lên Cloudflare
          </button>
        ) : null}
        {phase === "uploading" ? (
          <button
            type="button"
            onClick={() => {
              uploadRef.current?.abort();
              setPhase("paused");
            }}
            className={buttonClass("secondary")}
          >
            <Pause size={18} aria-hidden /> Tạm dừng
          </button>
        ) : null}
        {phase === "paused" || phase === "error" ? (
          <button
            type="button"
            onClick={() => {
              setPhase("uploading");
              if (uploadRef.current) uploadRef.current.start();
              else start();
            }}
            className={buttonClass("primary")}
          >
            <Play size={18} aria-hidden /> Tiếp tục
          </button>
        ) : null}
        {file ? (
          <button type="button" onClick={reset} className={buttonClass("ghost")}>
            <X size={18} aria-hidden /> {phase === "done" ? "Tải video khác" : "Huỷ"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
