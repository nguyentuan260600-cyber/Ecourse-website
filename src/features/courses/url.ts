import type { CatalogFilters } from "./types";

/** Build a /courses URL from filters, dropping defaults so URLs stay canonical. */
export function catalogHref(f: Partial<CatalogFilters>, overrides: Partial<CatalogFilters> = {}): string {
  const m = { ...f, ...overrides };
  const p = new URLSearchParams();
  if (m.q) p.set("q", m.q);
  if (m.category) p.set("category", m.category);
  if (m.level?.length) p.set("level", m.level.join(","));
  if (m.duration?.length) p.set("duration", m.duration.join(","));
  if (m.price) p.set("price", m.price);
  if (m.maxPrice !== undefined) p.set("maxPrice", String(m.maxPrice));
  if (m.rating !== undefined) p.set("rating", String(m.rating));
  if (m.sort && m.sort !== "popular") p.set("sort", m.sort);
  if (m.page && m.page > 1) p.set("page", String(m.page));
  const s = p.toString();
  return s ? `/courses?${s}` : "/courses";
}
