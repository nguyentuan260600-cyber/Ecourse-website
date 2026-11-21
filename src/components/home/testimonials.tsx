import Link from "next/link";
import { Quote } from "lucide-react";
import type { FeaturedReview } from "@/features/courses/repository";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/rating";
import { SectionHeading } from "./section-heading";

/** Renders real published reviews only. Hidden when there are none. */
export function Testimonials({ reviews }: { reviews: FeaturedReview[] }) {
  if (!reviews.length) return null;
  return (
    <section className="container-page py-14">
      <SectionHeading eyebrow="Học viên nói gì" title="Câu chuyện từ học viên" description="Trích từ đánh giá đã xác minh của học viên đã đăng ký khoá học." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.id} className="flex min-w-0 flex-col gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
            <div className="flex items-center justify-between">
              <Stars value={r.rating} />
              <Quote size={22} className="text-brand-soft" aria-hidden />
            </div>
            <blockquote className="flex-1 text-[15px] leading-7 text-ink">“{r.body}”</blockquote>
            <figcaption className="flex items-center gap-3 border-t border-line/70 pt-4">
              <Avatar src={r.authorAvatarUrl} name={r.authorName} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{r.authorName}</p>
                <Link href={`/courses/${r.courseSlug}`} className="block truncate text-xs text-ink-subtle hover:text-brand-strong">
                  {r.courseTitle}
                </Link>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
