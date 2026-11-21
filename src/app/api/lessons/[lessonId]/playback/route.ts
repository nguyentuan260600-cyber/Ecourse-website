import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signedPlayerUrl, StreamError } from "@/lib/cloudflare/stream";

const params = z.object({ lessonId: z.uuid() });

/**
 * Returns a short-lived signed player URL for a lesson video.
 * Access is decided by the database (get_lesson_content → can_view_lesson):
 * preview lessons of published courses, or an active, non-revoked access grant.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/lessons/[lessonId]/playback">) {
  const parsed = params.safeParse(await ctx.params);
  if (!parsed.success) return NextResponse.json({ error: "Bài học không hợp lệ" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu" }, { status: 503 });

  const { data, error } = await supabase.rpc("get_lesson_content", { p_lesson: parsed.data.lessonId });
  if (error) return NextResponse.json({ error: "Không thể kiểm tra quyền truy cập" }, { status: 500 });
  const lesson = (data as { video_uid: string | null }[] | null)?.[0];
  if (!lesson) return NextResponse.json({ error: "Bạn chưa có quyền xem bài học này" }, { status: 403 });
  if (!lesson.video_uid) return NextResponse.json({ error: "Bài học chưa có video" }, { status: 404 });

  try {
    const { url, video } = await signedPlayerUrl(lesson.video_uid, { poster: true });
    if (!url) return NextResponse.json({ error: "Video đang được xử lý", state: video.state }, { status: 409 });
    return NextResponse.json({ url }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    const status = e instanceof StreamError ? e.status : 500;
    return NextResponse.json({ error: e instanceof StreamError ? e.message : "Lỗi máy chủ" }, { status });
  }
}
