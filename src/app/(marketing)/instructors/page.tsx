import type { Metadata } from "next";
import Link from "next/link";
import { getAllCourses, getInstructors } from "@/features/courses/repository";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingInline } from "@/components/ui/rating";

export const metadata: Metadata = {
  title: "Giảng viên",
  alternates: { canonical: "/instructors" },
};

export default async function InstructorsPage() {
  const [instructors, courses] = await Promise.all([
    getInstructors(),
    getAllCourses(),
  ]);
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Đội ngũ giảng viên
      </h1>
      <p className="mt-2 text-ink-muted">
        Những người làm nghề chia sẻ kinh nghiệm thực chiến.
      </p>
      {instructors.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Users size={26} aria-hidden />}
          title="Chưa có giảng viên"
          description="Giảng viên sẽ xuất hiện tại đây khi hồ sơ giảng viên được kích hoạt."
        />
      ) : null}
      <div className="mt-8 flex flex-col gap-5">
        {instructors.map((i) => {
          const mine = courses.filter((c) => c.instructor.id === i.id);
          return (
            <section
              key={i.id}
              id={i.slug}
              className="scroll-mt-24 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60"
            >
              <div className="flex flex-col gap-5 sm:flex-row">
                <Avatar
                  src={i.avatarUrl}
                  name={i.name}
                  size={88}
                  className="rounded-2xl"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-ink">{i.name}</h2>
                  <p className="text-sm font-semibold text-brand-strong">
                    {i.headline}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">
                    {i.biography}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-muted">
                    <span>{mine.length} khoá học</span>
                    <RatingInline value={i.averageRating} />
                  </div>
                </div>
              </div>
              {mine.length ? (
                <ul className="mt-5 flex flex-wrap gap-2 border-t border-line/70 pt-4">
                  {mine.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/courses/${c.slug}`}
                        className="inline-block rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-brand-strong"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
