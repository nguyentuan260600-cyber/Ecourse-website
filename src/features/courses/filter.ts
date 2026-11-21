import {
  DURATION_BUCKETS,
  PAGE_SIZE,
  type CatalogFilters,
  type CatalogResult,
  type CourseSummary,
} from "./types";

/** Strip Vietnamese diacritics so "lap trinh" matches "Lập trình". */
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * In-memory catalog filtering. Used by the dev fixture adapter; the Supabase
 * adapter pushes the same rules into SQL (see supabase/migrations/*_catalog_search.sql).
 */
export function filterCourses(all: CourseSummary[], f: CatalogFilters): CatalogResult {
  const q = f.q ? normalizeText(f.q) : "";
  let items = all.filter((c) => {
    if (q) {
      const hay = normalizeText(
        [c.title, c.shortDescription, c.instructor.name, c.category.name, ...c.tags].join(" "),
      );
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    if (f.category && c.category.slug !== f.category) return false;
    if (f.level.length && !f.level.includes(c.level)) return false;
    if (f.price === "free" && c.priceVnd !== 0) return false;
    if (f.price === "paid" && c.priceVnd === 0) return false;
    if (f.maxPrice !== undefined && c.priceVnd > f.maxPrice) return false;
    if (f.rating !== undefined && c.ratingAverage < f.rating) return false;
    if (f.duration.length) {
      const ok = f.duration.some((b) => {
        const { min, max } = DURATION_BUCKETS[b];
        return c.durationSeconds >= min && c.durationSeconds < max;
      });
      if (!ok) return false;
    }
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (f.sort) {
      case "newest":
        return b.publishedAt.localeCompare(a.publishedAt);
      case "rating":
        return b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount;
      case "price-asc":
        return a.priceVnd - b.priceVnd;
      case "price-desc":
        return b.priceVnd - a.priceVnd;
      default:
        return b.studentCount - a.studentCount;
    }
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(f.page, pageCount);
  return {
    items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    page,
    pageCount,
  };
}
