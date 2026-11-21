import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { CourseSummary } from "@/features/courses/types";
import { LEVEL_LABEL } from "@/features/courses/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingInline } from "@/components/ui/rating";
import { formatDuration } from "@/lib/utils/format";
import { CourseThumb } from "./course-thumb";
import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";

export function CourseCard({ course, priority }: { course: CourseSummary; priority?: boolean }) {
  const href = `/courses/${course.slug}`;
  return (
    <article className="group relative flex h-full flex-col rounded-3xl bg-card p-3 shadow-[var(--shadow-soft)] ring-1 ring-line/60 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="relative">
        <CourseThumb src={course.thumbnailUrl} alt="" priority={priority} className="aspect-[16/10] rounded-2xl" />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {course.badge ? <Badge tone="solid">{course.badge}</Badge> : null}
          {course.tags[0] ? <Badge tone="dark">{course.tags[0]}</Badge> : null}
        </div>
        <WishlistButton courseId={course.id} courseTitle={course.title} className="absolute top-2.5 right-2.5 z-10" />
        <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-2 rounded-xl bg-ink/70 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} aria-hidden /> {formatDuration(course.durationSeconds)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={13} aria-hidden /> {course.lessonCount} bài học
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-display text-[11px] font-bold tracking-wider text-brand-strong uppercase">{LEVEL_LABEL[course.level]}</span>
          <RatingInline value={course.ratingAverage} count={course.ratingCount} />
        </div>
        <h3 className="line-clamp-2 font-display text-[17px] leading-snug font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-ink-muted">{course.shortDescription}</p>
        <div className="flex items-center gap-2.5">
          <Avatar src={course.instructor.avatarUrl} name={course.instructor.name} size={30} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-ink">{course.instructor.name}</p>
            <p className="truncate text-[11px] text-ink-subtle">{course.instructor.headline}</p>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <Price price={course.priceVnd} compareAt={course.compareAtPriceVnd} />
        </div>
        <span className="flex h-10 items-center justify-center rounded-xl bg-brand-soft font-display text-sm font-bold text-brand-ink transition group-hover:bg-brand group-hover:text-white">
          {course.priceVnd === 0 ? "Học miễn phí" : "Xem & đăng ký"}
        </span>
      </div>
    </article>
  );
}
