import { describe, expect, it } from "vitest";
import { filterCourses, normalizeText } from "./filter";
import { catalogFiltersSchema, type CourseSummary } from "./types";
import { catalogHref } from "./url";

const base: Omit<CourseSummary, "id" | "slug" | "title" | "priceVnd" | "level" | "durationSeconds" | "ratingAverage"> = {
  shortDescription: "",
  thumbnailUrl: null,
  compareAtPriceVnd: null,
  category: { slug: "lap-trinh-ai", name: "Lập trình" },
  instructor: { id: "i", slug: "i", name: "Nguyễn Văn A", headline: "", avatarUrl: null },
  lessonCount: 10,
  ratingCount: 1,
  studentCount: 1,
  badge: null,
  tags: [],
  publishedAt: "2025-01-01",
};
const courses: CourseSummary[] = [
  { ...base, id: "1", slug: "a", title: "Lập trình Python cơ bản", priceVnd: 0, level: "beginner", durationSeconds: 3 * 3600, ratingAverage: 4.2 },
  { ...base, id: "2", slug: "b", title: "Kiến trúc hệ thống", priceVnd: 2_000_000, level: "advanced", durationSeconds: 30 * 3600, ratingAverage: 4.9, studentCount: 50 },
  { ...base, id: "3", slug: "c", title: "Thiết kế Figma", priceVnd: 900_000, level: "beginner", durationSeconds: 10 * 3600, ratingAverage: 4.6, category: { slug: "thiet-ke", name: "Thiết kế" } },
];
const parse = (o: Record<string, string>) => catalogFiltersSchema.parse(o);

describe("catalog filters", () => {
  it("matches Vietnamese text without diacritics", () => {
    expect(normalizeText("Lập Trình Đồ hoạ")).toBe("lap trinh do hoa");
    expect(filterCourses(courses, parse({ q: "lap trinh python" })).items.map((c) => c.id)).toEqual(["1"]);
  });
  it("filters by free/paid, level, category, rating, duration, max price", () => {
    expect(filterCourses(courses, parse({ price: "free" })).total).toBe(1);
    expect(filterCourses(courses, parse({ price: "paid" })).total).toBe(2);
    expect(filterCourses(courses, parse({ level: "beginner" })).total).toBe(2);
    expect(filterCourses(courses, parse({ category: "thiet-ke" })).total).toBe(1);
    expect(filterCourses(courses, parse({ rating: "4.5" })).total).toBe(2);
    expect(filterCourses(courses, parse({ duration: "medium" })).items.map((c) => c.id)).toEqual(["3"]);
    expect(filterCourses(courses, parse({ maxPrice: "1000000" })).total).toBe(2);
  });
  it("sorts by price", () => {
    expect(filterCourses(courses, parse({ sort: "price-desc" })).items.map((c) => c.id)).toEqual(["2", "3", "1"]);
  });
  it("ignores invalid params instead of crashing", () => {
    const f = parse({ sort: "drop table", page: "-4", level: "hacker,beginner", category: "../../etc" });
    expect(f.sort).toBe("popular");
    expect(f.page).toBe(1);
    expect(f.level).toEqual(["beginner"]);
    expect(f.category).toBeUndefined();
  });
  it("clamps page beyond range", () => {
    expect(filterCourses(courses, parse({ page: "99" })).page).toBe(1);
  });
  it("builds canonical URLs", () => {
    expect(catalogHref(parse({}))).toBe("/courses");
    expect(catalogHref(parse({ q: "ai", level: "beginner,advanced" }), { page: 2 })).toBe("/courses?q=ai&level=beginner%2Cadvanced&page=2");
  });
});
