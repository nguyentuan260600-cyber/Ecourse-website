import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { Instructor } from "@/features/courses/types";
import { Avatar } from "@/components/ui/avatar";
import { RatingInline } from "@/components/ui/rating";
import { SectionHeading } from "./section-heading";

export function InstructorHighlights({ instructors }: { instructors: Instructor[] }) {
  if (!instructors.length) return null;
  return (
    <section className="container-page py-14">
      <SectionHeading
        eyebrow="Đội ngũ giảng viên"
        icon={<Users size={16} aria-hidden />}
        title="Học từ người đã làm"
        action={
          <Link href="/instructors" className="inline-flex items-center gap-1 font-display text-sm font-bold text-brand-strong hover:underline">
            Tất cả giảng viên <ArrowRight size={16} aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {instructors.slice(0, 4).map((i) => (
          <Link key={i.id} href={`/instructors#${i.slug}`} className="group flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <Avatar src={i.avatarUrl} name={i.name} size={64} className="ring-4 ring-brand-soft" />
            <div>
              <h3 className="text-lg font-bold text-ink group-hover:text-brand-strong">{i.name}</h3>
              <p className="text-sm text-ink-muted">{i.headline}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {i.expertise.slice(0, 3).map((e) => (
                <span key={e} className="rounded-lg bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-line/70 pt-3 text-xs text-ink-muted">
              <span>{i.courseCount} khoá học</span>
              <RatingInline value={i.averageRating} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
