import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/features/auth/session";
import { getAllCourses } from "@/features/courses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/courses/course-card";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Danh sách yêu thích", robots: { index: false } };

export default async function WishlistPage() {
  await requireUser("/wishlist");
  const supabase = (await createSupabaseServerClient())!;
  const [{ data }, all] = await Promise.all([supabase.from("wishlists").select("course_id").order("created_at", { ascending: false }), getAllCourses()]);
  const ids = new Set((data ?? []).map((r) => r.course_id));
  const items = all.filter((c) => ids.has(c.id));
  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-ink">Danh sách yêu thích</h1>
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart size={26} aria-hidden />}
          title="Chưa có khoá học yêu thích"
          description="Bấm biểu tượng trái tim trên khoá học để lưu lại xem sau."
          action={
            <Link href="/courses" className={buttonClass("primary", "md", "mt-2")}>
              Khám phá khoá học
            </Link>
          }
        />
      )}
    </div>
  );
}
