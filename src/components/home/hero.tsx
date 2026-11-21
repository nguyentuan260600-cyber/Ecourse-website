import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Search, Sparkles, Star } from "lucide-react";
import type { CatalogStats } from "@/features/courses/repository";
import { buttonClass } from "@/components/ui/button";
import { formatCount } from "@/lib/utils/format";

const popularSearches = [
  "Next.js",
  "AI Agent",
  "Figma",
  "Kubernetes",
  "Tiếng Anh",
];

export function Hero({ stats }: { stats: CatalogStats }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand/20 via-brand-soft/60 to-accent/20 blur-[120px]"
      />
      <div className="container-page grid items-center gap-14 py-14 lg:grid-cols-12 lg:py-20">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-card/80 px-3.5 py-1.5 shadow-[var(--shadow-soft)] ring-1 ring-line/60 backdrop-blur">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-success"
              aria-hidden
            />
            <span className="font-display text-xs font-bold tracking-wider text-brand-strong uppercase">
              Học trực tuyến thực chiến
            </span>
            <span className="text-line-strong" aria-hidden>
              •
            </span>
            <span className="text-xs font-medium text-ink-muted">
              Truy cập trọn đời
            </span>
          </div>
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[56px]">
            Khai phóng <span className="text-gradient-brand">năng lực số</span>{" "}
            — học từ chuyên gia thực chiến
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink-muted">
            Khoá học video chất lượng cao cho kỹ sư phần mềm, designer, chuyên
            gia dữ liệu và nhà quản lý. Giáo trình theo dự án, theo dõi tiến độ
            rõ ràng và chứng chỉ hoàn thành có thể xác thực.
          </p>

          <form
            action="/courses"
            role="search"
            className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-lift)] ring-1 ring-line/60 sm:flex-row"
          >
            <label htmlFor="hero-q" className="sr-only">
              Bạn muốn học gì?
            </label>
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                id="hero-q"
                name="q"
                type="search"
                placeholder="Bạn muốn học gì hôm nay?"
                className="h-12 w-full rounded-xl bg-transparent pr-3 pl-11 text-[15px] text-ink outline-none placeholder:text-ink-subtle"
              />
            </div>
            <button
              type="submit"
              className={buttonClass("primary", "md", "h-12")}
            >
              <Sparkles size={18} aria-hidden /> Tìm khoá học
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-subtle">Phổ biến:</span>
            {popularSearches.map((q) => (
              <Link
                key={q}
                href={`/courses?q=${encodeURIComponent(q)}`}
                className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-ink-muted ring-1 ring-line transition hover:text-brand-strong hover:ring-brand/40"
              >
                {q}
              </Link>
            ))}
          </div>

          {stats.publishedCourses > 0 ? (
            <dl className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              {[
                { k: "Khoá học", v: formatCount(stats.publishedCourses) },
                { k: "Bài học", v: formatCount(stats.totalLessons) },
                { k: "Giảng viên", v: formatCount(stats.instructors) },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl bg-card/70 px-4 py-3 ring-1 ring-line/60"
                >
                  <dt className="text-xs font-medium text-ink-subtle">{s.k}</dt>
                  <dd className="font-display text-2xl font-extrabold text-ink">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {/* Product illustration (decorative, not real user data) */}
        <div className="relative lg:col-span-5" aria-hidden>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-brand to-accent opacity-30 blur-xl" />
            <div className="relative flex flex-col gap-5 rounded-[28px] bg-card p-6 shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 font-display text-[11px] font-bold text-brand-ink">
                    ĐANG HỌC
                  </span>
                  <span className="flex items-center gap-1 font-display text-[11px] font-bold text-accent-ink">
                    <Star size={13} className="fill-accent text-accent" /> Bài 8
                    / 12
                  </span>
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
                </span>
              </div>
              <div className="relative h-48 overflow-hidden rounded-2xl">
                <Image
                  src="/images/hero-ide.jpg"
                  alt=""
                  fill
                  priority
                  sizes="(min-width:1024px) 480px, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#131b2e]/85 via-transparent to-transparent p-4">
                  <div>
                    <span className="rounded bg-brand/85 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Chương 08
                    </span>
                    <p className="mt-1 font-display font-bold text-white">
                      Fullstack Next.js & Multi-Agent AI
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold text-ink-muted">
                  <span>Tiến độ khoá học</span>
                  <span className="text-brand-strong">Tự động lưu</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-brand-strong to-brand" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2.5">
                  {["avatar-1", "avatar-2", "avatar-3"].map((a) => (
                    <Image
                      key={a}
                      src={`/images/${a}.jpg`}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-card"
                    />
                  ))}
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
                  <CheckCircle2 size={15} className="text-success" /> Quiz
                  chương đã đạt
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden max-w-[250px] items-center gap-3 rounded-2xl bg-card/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur sm:flex">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <BadgeCheck size={22} />
              </div>
              <div>
                <p className="font-display text-[11px] font-bold text-accent-ink uppercase">
                  Chứng chỉ hoàn thành
                </p>
                <p className="text-sm leading-tight font-semibold text-ink">
                  Có mã xác thực công khai
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
