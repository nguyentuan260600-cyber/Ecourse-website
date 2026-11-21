"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WishlistResult = { ok: true; saved: boolean } | { ok: false; reason: "auth" | "demo" | "error" };

const courseId = z.uuid();

export async function toggleWishlist(rawCourseId: string): Promise<WishlistResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "demo" };
  const parsed = courseId.safeParse(rawCourseId);
  if (!parsed.success) return { ok: false, reason: "error" };

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { ok: false, reason: "auth" };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("course_id")
    .eq("user_id", userId)
    .eq("course_id", parsed.data)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("wishlists").delete().eq("user_id", userId).eq("course_id", parsed.data);
    return error ? { ok: false, reason: "error" } : { ok: true, saved: false };
  }
  const { error } = await supabase.from("wishlists").insert({ user_id: userId, course_id: parsed.data });
  return error ? { ok: false, reason: "error" } : { ok: true, saved: true };
}
