import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, SearchX, X } from "lucide-react";
import { AutoSubmitForm } from "@/components/catalog/auto-submit-form";
import { FilterPanel } from "@/components/catalog/filter-panel";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, searchCourses } from "@/features/courses/repository";
import { catalogFiltersSchema, DURATION_BUCKETS, LEVEL_LABEL, SORT_OPTIONS, type CatalogFilters } from "@/features/courses/types";
import { catalogHref } from "@/features/courses/url";
import { formatVnd } from "@/lib/utils/format";

export async function generateMetadata({ searchParams }: PageProps<"/courses">): Promise<Metadata> {
  const f = catalogFiltersSchema.parse(await searchParams);
  const title = f.q ? `Kết quả cho “${f.q}”` : "Khám phá khoá học";
  return {
    title,
    description: "Tìm khoá học lập trình, AI, thiết kế, dữ liệu, kinh doanh và ngoại ngữ. Lọc theo cấp độ, học phí, thời lượng và đánh giá.",
    alternates: { canonical: catalogHref({ category: f.category, page: f.page }) },
    robots: f.q || f.level.length || f.duration.length || f.rating || f.maxPrice || f.price ? { index: false, follow: true } : undefined,
  };
}

function activeChips(f: CatalogFilters, categoryName?: string) {
  const chips: { label: string; href: string }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, href: catalogHref(f, { q: undefined, page: 1 }) });
  if (f.category) chips.push({ label: categoryName ?? f.category, href: catalogHref(f, { category: undefined, page: 1 }) });
  for (const l of f.level) chips.push({ label: LEVEL_LABEL[l], href: catalogHref(f, { level: f.level.filter((x) => x !== l), page: 1 }) });
  for (const d of f.duration) chips.push({ label: DURATION_BUCKETS[d].label, href: catalogHref(f, { duration: f.duration.filter((x) => x !== d), page: 1 }) });
  if (f.price) chips.push({ label: f.price === "free" ? "Miễn phí" : "Có phí", href: catalogHref(f, { price: undefined, page: 1 }) });
  if (f.maxPrice !== undefined) chips.push({ label: `≤ ${formatVnd(f.maxPrice)}`, href: catalogHref(f, { maxPrice: undefined, page: 1 }) });
  if (f.rating !== undefined) chips.push({ label: `${f.rating}★ trở lên`, href: catalogHref(f, { rating: undefined, page: 1 }) });
  return chips;
}

export default async function CoursesPage({ searchParams }: PageProps<"/courses">) {
  const f = catalogFiltersSchema.parse(await searchParams);
  const [result, categories] = await Promise.all([searchCourses(f), getCategories()]);
  const category = categories.find((c) => c.slug === f.category);
  const chips = activeChips(f, category?.name);
  const from = result.total ? (result.page - 1) * 9 + 1 : 0;
  const to = (result.page - 1) * 9 + result.items.length;

  return (
    <AutoSubmitForm className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink-subtle">
        <Link href="/" className="flex items-center gap-1 hover:text-ink">
          <Home size={13} aria-hidden /> Trang chủ
        </Link>
        <ChevronRight size={13} aria-hidden />
        <span className="font-semibold text-ink">{category ? category.name : "Tất cả khoá học"}</span>
      </nav>

      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden /> Kho tri thức chuẩn công nghiệp
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{category ? category.name : "Khám phá khoá học công nghệ & sáng tạo"}</h1>
          <p className="mt-2 text-ink-muted">{category?.description ?? "Tiếp cận tri thức thực chiến từ các kỹ sư, designer và chuyên gia giàu kinh nghiệm."}</p>
        </div>
        <div className="w-full lg:max-w-md">
          <label htmlFor="catalog-q" className="sr-only">
            Tìm kiếm khoá học
          </label>
          <input
            id="catalog-q"
            name="q"
            type="search"
            data-noauto
            defaultValue={f.q ?? ""}
            placeholder="Tìm khoá học, kỹ năng... (nhấn Enter)"
            className="h-12 w-full rounded-2xl bg-card px-4 text-[15px] text-ink shadow-[var(--shadow-soft)] ring-1 ring-line outline-none placeholder:text-ink-subtle focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-card px-5 py-3 shadow-[var(--shadow-soft)] ring-1 ring-line/60 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {result.total ? (
            <>
              Hiển thị <strong className="text-ink">{from}–{to}</strong> trong <strong className="text-ink">{result.total}</strong> khoá học
            </>
          ) : (
            "Không có khoá học phù hợp"
          )}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-semibold whitespace-nowrap text-ink-subtle">
            Sắp xếp theo
          </label>
          <Select id="sort" name="sort" defaultValue={f.sort} className="h-10 w-48 text-sm">
            {Object.entries(SORT_OPTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {chips.length ? (
        <ul className="mb-6 flex flex-wrap gap-2" aria-label="Bộ lọc đang áp dụng">
          {chips.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink hover:bg-surface-3">
                {c.label} <X size={12} aria-label="Bỏ lọc" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <FilterPanel activeCount={chips.length}>
            <FilterSidebar f={f} categories={categories} />
          </FilterPanel>
        </aside>

        <section aria-label="Kết quả tìm kiếm" className="flex flex-col gap-10 [form[data-pending]_&]:opacity-60 transition-opacity">
          {result.items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((c, i) => (
                <CourseCard key={c.id} course={c} priority={i < 3} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX size={26} aria-hidden />}
              title="Không tìm thấy khoá học phù hợp"
              description="Thử bỏ bớt bộ lọc hoặc dùng từ khoá khác, ví dụ “Next.js”, “Figma”, “dữ liệu”."
              action={
                <Link href="/courses" className="mt-2 font-display text-sm font-bold text-brand-strong hover:underline">
                  Xem tất cả khoá học
                </Link>
              }
            />
          )}
          <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => catalogHref(f, { page: p })} />
        </section>
      </div>
    </AutoSubmitForm>
  );
}
