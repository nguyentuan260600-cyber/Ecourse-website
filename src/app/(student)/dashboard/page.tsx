import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, CheckCircle2, GraduationCap, LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/session";
import { getAllCourses } from "@/features/courses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CourseThumb } from "@/components/courses/course-thumb";
import { CourseCard } from "@/components/courses/course-card";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Tổng quan học tập", robots: { index: false } };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const sp = await searchParams;
  const supabase = (await createSupabaseServerClient())!;

  // RLS guarantees these only return the current user's rows.
  const [{ data: enrollments }, { count: certCount }, catalog] = await Promise.all([
    supabase.from("enrollments").select("course_id,enrolled_at,completed_at,last_accessed_at").order("last_accessed_at", { ascending: false, nullsFirst: false }),
    supabase.from("certificates").select("id", { count: "exact", head: true }).is("revoked_at", null),
    getAllCourses(),
  ]);
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const mine = (enrollments ?? []).flatMap((e) => (byId.get(e.course_id) ? [{ ...e, course: byId.get(e.course_id)! }] : []));
  const completed = mine.filter((e) => e.completed_at).length;
  const isStaff = user.roles.some((r) => r === "admin" || r === "super_admin" || r === "instructor");

  return (
    <div className="container-page py-10">
      {sp.error === "forbidden" ? (
        <p role="alert" className="mb-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Bạn không có quyền truy cập trang đó.
        </p>
      ) : null}
      {sp.password === "updated" ? (
        <p role="status" className="mb-6 rounded-xl bg-success-soft px-4 py-3 text-sm text-success-ink">
          Đã cập nhật mật khẩu.
        </p>
      ) : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-ink-muted">Xin chào,</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{user.displayName} 👋</h1>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={buttonClass("secondary", "sm")}>
            <LogOut size={16} aria-hidden /> Đăng xuất
          </button>
        </form>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Khoá học đã ghi danh", value: mine.length },
          { icon: CheckCircle2, label: "Đã hoàn thành", value: completed },
          { icon: Award, label: "Chứng chỉ", value: certCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
              <s.icon size={20} aria-hidden />
            </span>
            <div>
              <dt className="text-xs text-ink-subtle">{s.label}</dt>
              <dd className="font-display text-2xl font-extrabold text-ink">{s.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {isStaff ? (
        <p className="mt-6 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm text-ink-muted">
          <ShieldCheck size={16} className="text-brand" aria-hidden /> Vai trò: {user.roles.join(", ")}. Khu vực giảng viên và quản trị sẽ có trong Milestone 5.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-ink">Khoá học của tôi</h2>
        {mine.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((e) => (
              <li key={e.course_id} className="flex gap-4 rounded-3xl bg-card p-3 ring-1 ring-line/60">
                <CourseThumb src={e.course.thumbnailUrl} alt="" className="aspect-square w-24 shrink-0 rounded-2xl" sizes="96px" />
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <Link href={`/courses/${e.course.slug}`} className="line-clamp-2 font-display font-semibold text-ink hover:text-brand-strong">
                    {e.course.title}
                  </Link>
                  <span className="text-xs text-ink-subtle">{e.completed_at ? "Đã hoàn thành" : "Đang học"}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<GraduationCap size={26} aria-hidden />}
            title="Bạn chưa ghi danh khoá học nào"
            description="Bắt đầu với một khoá học miễn phí hoặc khám phá danh mục khoá học."
            action={
              <Link href="/courses" className={buttonClass("primary", "md", "mt-2")}>
                Khám phá khoá học
              </Link>
            }
          />
        )}
      </section>

      {!mine.length && catalog.length ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-ink">Gợi ý cho bạn</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...catalog].sort((a, b) => b.studentCount - a.studentCount).slice(0, 4).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
