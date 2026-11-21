import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { createTusUpload, isStreamConfigured, StreamError } from "@/lib/cloudflare/stream";

const MAX_BYTES = 30 * 1024 ** 3; // Cloudflare Stream per-file limit
const MAX_DURATION_SECONDS = 6 * 3600;

function decodeTusMetadata(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (header ?? "").split(",")) {
    const [key, value] = pair.trim().split(" ");
    if (!key) continue;
    try {
      out[key] = value ? Buffer.from(value, "base64").toString("utf8") : "";
    } catch {
      /* ignore malformed entries */
    }
  }
  return out;
}

/**
 * tus "creation" endpoint for tus-js-client. Checks the caller is an admin or
 * instructor, then asks Cloudflare for a one-time upload URL and returns it in
 * the Location header. The file itself goes browser → Cloudflare directly.
 * Only the file name is taken from the client; all other upload settings
 * (signed URLs required, max duration) are fixed here.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!user.roles.some((r) => r === "admin" || r === "super_admin" || r === "instructor")) {
    return NextResponse.json({ error: "Không có quyền tải video" }, { status: 403 });
  }
  if (!isStreamConfigured) return NextResponse.json({ error: "Cloudflare Stream chưa được cấu hình" }, { status: 503 });

  const length = Number(req.headers.get("upload-length"));
  if (!Number.isSafeInteger(length) || length <= 0 || length > MAX_BYTES) {
    return NextResponse.json({ error: "Kích thước tệp không hợp lệ (tối đa 30 GB)" }, { status: 413 });
  }
  const meta = decodeTusMetadata(req.headers.get("upload-metadata"));
  const name = (meta.name || meta.filename || "Video").replace(/[\u0000-\u001f]/g, "").slice(0, 200);

  try {
    const { uploadUrl, uid } = await createTusUpload({
      uploadLength: length,
      name,
      maxDurationSeconds: MAX_DURATION_SECONDS,
      creator: user.id,
    });
    return new NextResponse(null, {
      status: 201,
      headers: {
        Location: uploadUrl,
        "Tus-Resumable": "1.0.0",
        ...(uid ? { "Stream-Media-Id": uid } : {}),
        "Access-Control-Expose-Headers": "Location, Stream-Media-Id",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const status = e instanceof StreamError ? e.status : 500;
    return NextResponse.json({ error: e instanceof StreamError ? e.message : "Lỗi máy chủ" }, { status });
  }
}
