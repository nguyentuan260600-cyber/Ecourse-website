import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarClock, CheckCircle2, ChevronRight, Clock, Globe, ListChecks, PlayCircle, ShieldCheck, Target, Users } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { CourseCard } from "@/components/courses/course-card";
import { CourseThumb } from "@/components/courses/course-thumb";
import { Curriculum } from "@/components/courses/curriculum";
import { Price } from "@/components/courses/price";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/rating";
import { siteConfig } from "@/config/site";
import { getAllCourses, getCourseBySlug, getRelatedCourses } from "@/features/courses/repository";
import { LEVEL_LABEL } from "@/features/courses/types";
import { formatCount, formatDate, formatDuration } from "@/lib/utils/format";

export async function generateStaticParams() {
  return (await getAllCourses().catch(() => [])).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCourseBySlug(slug);
  if (!c) return { title: "Không tìm thấy khoá học" };
  return {
    title: c.title,
    description: c.shortDescription,
    alternates: { canonical: `/courses/${c.slug}` },
    openGraph: { type: "website", title: c.title, description: c.shortDescription, images: c.thumbnailUrl ? [{ url: c.thumbnailUrl }] : undefined },
  };
}

function Block({ id, icon, title, children }: { id?: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60 sm:p-8">
      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function CourseDetailPage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const related = await getRelatedCourses(course);
  const primary = course.instructors[0];
  const previewCount = course.sections.flatMap((s) => s.lessons).filter((l) => l.isPreview).length;

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink-subtle">
        <Link href="/courses" className="hover:text-ink">
          Khoá học
        </Link>
        <ChevronRight size={13} aria-hidden />
        <Link href={`/courses?category=${course.category.slug}`} className="hover:text-ink">
          {course.category.name}
        </Link>
        <ChevronRight size={13} aria-hidden />
        <span className="line-clamp-1 font-semibold text-ink">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {course.badge ? <Badge tone="accent">{course.badge}</Badge> : null}
              <Badge tone="neutral">
                <CalendarClock size={12} aria-hidden /> Cập nhật {formatDate(course.updatedAt)}
              </Badge>
              <Badge tone="neutral">
                <Globe size={12} aria-hidden /> {course.language}
              </Badge>
            </div>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">{course.title}</h1>
            <p className="text-lg leading-8 text-ink-muted">{course.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-surface px-5 py-4 ring-1 ring-line/60">
              <span className="flex items-center gap-2">
                <span className="font-display text-xl font-extrabold text-ink">{course.ratingAverage ? course.ratingAverage.toFixed(1) : "—"}</span>
                <Stars value={course.ratingAverage} />
                <span className="text-sm text-ink-subtle">({formatCount(course.ratingCount)} đánh giá)</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Users size={16} className="text-success" aria-hidden /> {formatCount(course.studentCount)} học viên
              </span>
              {primary ? (
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  <Avatar src={primary.avatarUrl} name={primary.name} size={26} /> Giảng viên:
                  <a href="#giang-vien" className="font-semibold text-ink hover:text-brand-strong">
                    {primary.name}
                  </a>
                </span>
              ) : null}
            </div>
          </header>

          <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
            <CourseThumb src={course.thumbnailUrl} alt={`Ảnh giới thiệu khoá học ${course.title}`} priority className="aspect-video" sizes="(min-width:1024px) 800px, 100vw" />
            <a href="#noi-dung" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-[#131b2e]/70 to-transparent text-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-[var(--shadow-brand)] transition hover:scale-105">
                <PlayCircle size={32} aria-hidden />
              </span>
              <span className="rounded-full bg-black/40 px-3 py-1 text-sm font-semibold backdrop-blur">
                {previewCount ? `${previewCount} bài học thử miễn phí` : "Xem giáo trình"}
              </span>
            </a>
          </div>

          {course.objectives.length ? (
            <Block icon={<Target size={18} aria-hidden />} title="Bạn sẽ đạt được gì?">
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.objectives.map((o) => (
                  <li key={o.title} className="flex gap-3 rounded-2xl bg-surface p-4">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" aria-hidden />
                    <div>
                      <p className="font-display font-semibold text-ink">{o.title}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">{o.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}

          {course.requirements.length ? (
            <Block icon={<ListChecks size={18} aria-hidden />} title="Yêu cầu tiên quyết">
              <ul className="grid gap-2 sm:grid-cols-2">
                {course.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-ink-muted">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {r}
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}

          <Block id="noi-dung" icon={<BookOpen size={18} aria-hidden />} title="Nội dung khoá học">
            <Curriculum sections={course.sections} />
          </Block>

          <Block icon={<BookOpen size={18} aria-hidden />} title="Mô tả khoá học">
            <p className="leading-8 whitespace-pre-line text-ink-muted">{course.description}</p>
          </Block>

          {course.instructors.map((i) => (
            <Block key={i.id} id="giang-vien" icon={<Users size={18} aria-hidden />} title="Giảng viên">
              <div className="flex flex-col gap-5 sm:flex-row">
                <Avatar src={i.avatarUrl} name={i.name} size={96} className="rounded-2xl" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-ink">{i.name}</h3>
                  <p className="text-sm font-semibold text-brand-strong">{i.headline}</p>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">{i.biography}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {i.expertise.map((e) => (
                      <span key={e} className="rounded-lg bg-surface px-2 py-0.5 text-xs font-semibold text-ink-muted">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Block>
          ))}

          <Block icon={<Stars value={1} size={18} />} title="Đánh giá từ học viên">
            {course.reviews.length ? (
              <div className="flex flex-col gap-6">
                <div className="grid items-center gap-6 rounded-2xl bg-surface p-6 sm:grid-cols-[160px_1fr]">
                  <div className="text-center">
                    <p className="font-display text-5xl font-extrabold text-ink">{course.ratingAverage.toFixed(1)}</p>
                    <Stars value={course.ratingAverage} className="mt-1" />
                    <p className="mt-1 text-xs text-ink-subtle">{formatCount(course.ratingCount)} đánh giá</p>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {([5, 4, 3, 2, 1] as const).map((k) => (
                      <li key={k} className="flex items-center gap-3 text-xs text-ink-muted">
                        <span className="w-10">{k} sao</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${course.ratingBreakdown[k]}%` }} />
                        </span>
                        <span className="w-9 text-right tabular-nums">{course.ratingBreakdown[k]}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="flex flex-col gap-4">
                  {course.reviews.map((r) => (
                    <li key={r.id} className="rounded-2xl p-4 ring-1 ring-line/70">
                      <div className="flex items-center gap-3">
                        <Avatar src={r.authorAvatarUrl} name={r.authorName} size={40} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ink">{r.authorName}</p>
                          <p className="text-xs text-ink-subtle">
                            {r.authorHeadline ? `${r.authorHeadline} • ` : ""}
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <Stars value={r.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-ink-muted">{r.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Chưa có đánh giá. Học viên đã ghi danh có thể để lại đánh giá đầu tiên.</p>
            )}
          </Block>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-lift)] ring-1 ring-line/60">
            <div className="h-1.5 bg-gradient-to-r from-brand-strong via-brand to-accent" />
            <div className="flex flex-col gap-5 p-6">
              <Price price={course.priceVnd} compareAt={course.compareAtPriceVnd} size="lg" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <AddToCartButton slug={course.slug} free={course.priceVnd === 0} />
                </div>
                <WishlistButton courseId={course.id} courseTitle={course.title} className="h-13 w-13 rounded-xl ring-1 ring-line" />
              </div>
              <div>
                <p className="mb-3 font-display text-sm font-bold text-ink">Khoá học bao gồm</p>
                <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
                  <li className="flex items-center gap-2.5">
                    <Clock size={16} className="text-brand" aria-hidden /> {formatDuration(course.durationSeconds)} video
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-brand" aria-hidden /> {course.lessonCount} bài học • {LEVEL_LABEL[course.level]}
                  </li>
                  {course.includes.map((x) => (
                    <li key={x} className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-brand" aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-surface p-4">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <p className="text-xs leading-5 text-ink-muted">
                  Thanh toán qua PayOS. Khoá học chỉ được kích hoạt sau khi giao dịch được ngân hàng xác nhận.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">Khoá học liên quan</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDescription,
          url: `${siteConfig.url}/courses/${course.slug}`,
          inLanguage: "vi",
          provider: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
          ...(course.ratingCount > 0
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: course.ratingAverage, ratingCount: course.ratingCount } }
            : {}),
          offers: { "@type": "Offer", category: course.priceVnd === 0 ? "Free" : "Paid", price: course.priceVnd, priceCurrency: "VND" },
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${Math.round(course.durationSeconds / 3600)}H` },
        }}
      />
    </div>
  );
}
