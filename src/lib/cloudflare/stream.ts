import "server-only";
import { serverEnv } from "@/lib/env.server";

/**
 * Cloudflare Stream (server only — the API token never reaches the browser).
 * Docs: https://developers.cloudflare.com/stream/
 *
 * - Uploads: tus resumable "direct creator uploads" (any size up to Stream's limit).
 * - Every video is created with requireSignedURLs, so a UID alone cannot be played.
 * - Playback: short-lived signed token minted after the caller checked access.
 */

const API = "https://api.cloudflare.com/client/v4";
const UID_RE = /^[a-f0-9]{32}$/;

export const isStreamConfigured = Boolean(serverEnv.cloudflareAccountId && serverEnv.cloudflareStreamApiToken);

export class StreamError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

export type StreamState = "pendingupload" | "downloading" | "queued" | "inprogress" | "ready" | "error" | "live-inprogress";

export interface StreamVideo {
  uid: string;
  name: string;
  state: StreamState;
  pctComplete: number | null;
  errorText: string | null;
  readyToStream: boolean;
  durationSeconds: number | null;
  thumbnail: string | null;
  requireSignedURLs: boolean;
  created: string;
  customerCode: string | null;
}

type RawVideo = {
  uid: string;
  meta?: { name?: string } | null;
  status?: { state?: StreamState; pctComplete?: string; errorReasonText?: string } | null;
  readyToStream?: boolean;
  duration?: number;
  thumbnail?: string;
  preview?: string;
  playback?: { hls?: string; dash?: string };
  requireSignedURLs?: boolean;
  created?: string;
};

function base() {
  if (!isStreamConfigured) throw new StreamError("Cloudflare Stream chưa được cấu hình", 503);
  return `${API}/accounts/${encodeURIComponent(serverEnv.cloudflareAccountId)}/stream`;
}

function authHeaders(extra: Record<string, string> = {}) {
  return { Authorization: `Bearer ${serverEnv.cloudflareStreamApiToken}`, ...extra };
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${base()}${path}`, { ...init, headers: authHeaders(init.headers as Record<string, string>), cache: "no-store" });
  const body = (await res.json().catch(() => null)) as { success?: boolean; result?: T; errors?: { message?: string }[] } | null;
  if (!res.ok || !body?.success) {
    // Log details server-side only; callers get a generic message.
    console.error("[cloudflare-stream]", res.status, body?.errors);
    throw new StreamError(res.status === 404 ? "Không tìm thấy video" : "Cloudflare Stream trả về lỗi", res.status === 404 ? 404 : 502);
  }
  return body.result as T;
}

function customerCodeFrom(v: RawVideo): string | null {
  for (const url of [v.playback?.hls, v.playback?.dash, v.preview, v.thumbnail]) {
    const m = url?.match(/customer-([a-z0-9]+)\.cloudflarestream\.com/);
    if (m) return m[1];
  }
  return serverEnv.cloudflareStreamCustomerCode || null;
}

function toVideo(v: RawVideo): StreamVideo {
  const pct = v.status?.pctComplete ? Number(v.status.pctComplete) : null;
  return {
    uid: v.uid,
    name: v.meta?.name ?? v.uid,
    state: v.status?.state ?? "pendingupload",
    pctComplete: Number.isFinite(pct) ? pct : null,
    errorText: v.status?.errorReasonText || null,
    readyToStream: Boolean(v.readyToStream),
    durationSeconds: typeof v.duration === "number" && v.duration >= 0 ? Math.round(v.duration) : null,
    thumbnail: v.thumbnail ?? null,
    requireSignedURLs: Boolean(v.requireSignedURLs),
    created: v.created ?? "",
    customerCode: customerCodeFrom(v),
  };
}

export function assertUid(uid: string) {
  if (!UID_RE.test(uid)) throw new StreamError("Mã video không hợp lệ", 400);
}

export async function getVideo(uid: string): Promise<StreamVideo> {
  assertUid(uid);
  return toVideo(await call<RawVideo>(`/${uid}`));
}

export async function listVideos(limit = 50): Promise<StreamVideo[]> {
  const result = await call<RawVideo[]>(`?limit=${Math.min(Math.max(limit, 1), 1000)}`);
  return result.map(toVideo);
}

/** Defense in depth: make sure a video cannot be played without a signed token. */
export async function ensureSignedUrls(uid: string) {
  assertUid(uid);
  await call(`/${uid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, requireSignedURLs: true }) });
}

/**
 * Starts a tus direct creator upload. Returns the one-time upload URL the
 * browser sends the file to (the API token stays here).
 */
export async function createTusUpload(opts: { uploadLength: number; name: string; maxDurationSeconds: number; creator?: string }) {
  const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
  const metadata = [
    `maxdurationseconds ${b64(String(opts.maxDurationSeconds))}`,
    "requiresignedurls",
    `name ${b64(opts.name)}`,
  ].join(",");
  const res = await fetch(`${base()}?direct_user=true`, {
    method: "POST",
    headers: authHeaders({
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(opts.uploadLength),
      "Upload-Metadata": metadata,
      ...(opts.creator ? { "Upload-Creator": opts.creator } : {}),
    }),
    cache: "no-store",
  });
  const location = res.headers.get("location");
  if (!res.ok || !location) {
    console.error("[cloudflare-stream] tus create failed", res.status, await res.text().catch(() => ""));
    throw new StreamError("Không tạo được phiên tải lên Cloudflare");
  }
  return { uploadUrl: location, uid: res.headers.get("stream-media-id") };
}

/** Short-lived signed playback token (default 1 hour). Caller MUST check access first. */
export async function createPlaybackToken(uid: string, ttlSeconds = 3600): Promise<string> {
  assertUid(uid);
  const exp = Math.floor(Date.now() / 1000) + Math.min(Math.max(ttlSeconds, 60), 6 * 3600);
  const result = await call<{ token: string }>(`/${uid}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exp, downloadable: false }),
  });
  return result.token;
}

/** Signed iframe URL for the Stream player, or null if the video is not playable yet. */
export async function signedPlayerUrl(uid: string, opts: { poster?: boolean; startTime?: number } = {}) {
  const video = await getVideo(uid);
  if (!video.readyToStream) return { url: null, video };
  const code = video.customerCode;
  if (!code) throw new StreamError("Thiếu CLOUDFLARE_STREAM_CUSTOMER_CODE", 500);
  const token = await createPlaybackToken(uid);
  const params = new URLSearchParams({ preload: "metadata", primaryColor: "#6d5ef7" });
  if (opts.startTime && opts.startTime > 0) params.set("startTime", String(Math.floor(opts.startTime)));
  if (opts.poster) params.set("poster", `https://customer-${code}.cloudflarestream.com/${token}/thumbnails/thumbnail.jpg`);
  return { url: `https://customer-${code}.cloudflarestream.com/${token}/iframe?${params}`, video };
}
