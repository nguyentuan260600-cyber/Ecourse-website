import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fixtureCategories } from "./fixtures";
import { filterCourses, normalizeText } from "./filter";
import {
  DURATION_BUCKETS,
  PAGE_SIZE,
  type CatalogFilters,
  type CatalogResult,
  type Category,
  type CourseDetail,
  type CourseLevel,
  type CourseSummary,
  type Instructor,
  type LessonType,
} from "./types";

/**
 * Catalog data access. Two adapters behind one interface:
 *  - "supabase": real data, RLS applies (reads as the current user / anon).
 *  - "demo": DEV-ONLY, used when Supabase env vars are missing: categories only,
 *    no courses/instructors/reviews.
 *    The UI shows a visible "Dữ liệu mẫu" banner in this mode.
 */
export type DataSource = "supabase" | "demo";
export const dataSource: DataSource = isSupabaseConfigured ? "supabase" : "demo";

export interface CatalogStats {
  publishedCourses: number;
  instructors: number;
  categories: number;
  totalLessons: number;
}

/* ------------------------------ demo adapter ------------------------------ */

const demo = {
  async categories(): Promise<Category[]> {
    return fixtureCategories;
  },
  async search(f: CatalogFilters): Promise<CatalogResult> {
    return filterCourses([], f);
  },
  async bySlug(): Promise<CourseDetail | null> {
    return null;
  },
  async all(): Promise<CourseSummary[]> {
    return [];
  },
  async instructors(): Promise<Instructor[]> {
    return [];
  },
};

/* ---------------------------- supabase adapter ---------------------------- */

type CardRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url: string | null;
  price_vnd: number;
  compare_at_price_vnd: number | null;
  level: CourseLevel;
  badge: string | null;
  published_at: string;
  category_slug: string | null;
  category_name: string | null;
  instructor_id: string | null;
  instructor_slug: string | null;
  instructor_name: string | null;
  instructor_headline: string | null;
  instructor_avatar_url: string | null;
  duration_seconds: number;
  lesson_count: number;
  rating_average: number | string;
  rating_count: number;
  student_count: number;
  tags: string[];
};

const CARD_COLUMNS =
  "id,slug,title,short_description,thumbnail_url,price_vnd,compare_at_price_vnd,level,badge,published_at,category_slug,category_name,instructor_id,instructor_slug,instructor_name,instructor_headline,instructor_avatar_url,duration_seconds,lesson_count,rating_average,rating_count,student_count,tags";

function toSummary(r: CardRow): CourseSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description,
    thumbnailUrl: r.thumbnail_url,
    priceVnd: Number(r.price_vnd),
    compareAtPriceVnd: r.compare_at_price_vnd == null ? null : Number(r.compare_at_price_vnd),
    level: r.level,
    category: { slug: r.category_slug ?? "", name: r.category_name ?? "Chưa phân loại" },
    instructor: {
      id: r.instructor_id ?? "",
      slug: r.instructor_slug ?? "",
      name: r.instructor_name ?? "Khai Sáng",
      headline: r.instructor_headline ?? "",
      avatarUrl: r.instructor_avatar_url,
    },
    durationSeconds: r.duration_seconds,
    lessonCount: r.lesson_count,
    ratingAverage: Number(r.rating_average),
    ratingCount: r.rating_count,
    studentCount: r.student_count,
    badge: r.badge,
    tags: r.tags ?? [],
    publishedAt: r.published_at,
  };
}

async function db() {
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("Supabase chưa được cấu hình");
  return client;
}

const supabaseAdapter = {
  async categories(): Promise<Category[]> {
    const client = await db();
    const [{ data: cats, error }, { data: cards }] = await Promise.all([
      client.from("categories").select("id,slug,name,description,tags").order("sort_order"),
      client.from("course_cards").select("category_slug"),
    ]);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const r of cards ?? []) counts.set(r.category_slug, (counts.get(r.category_slug) ?? 0) + 1);
    return (cats ?? []).map((c) => ({ ...c, courseCount: counts.get(c.slug) ?? 0 }));
  },

  async search(f: CatalogFilters): Promise<CatalogResult> {
    const client = await db();
    let query = client.from("course_cards").select(CARD_COLUMNS, { count: "exact" });
    if (f.q) for (const term of normalizeText(f.q).split(/\s+/).filter(Boolean)) {
      // terms are accent-folded; % and _ escaped to avoid wildcard injection
      query = query.ilike("search_text", `%${term.replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
    }
    if (f.category) query = query.eq("category_slug", f.category);
    if (f.level.length) query = query.in("level", f.level);
    if (f.price === "free") query = query.eq("price_vnd", 0);
    if (f.price === "paid") query = query.gt("price_vnd", 0);
    if (f.maxPrice !== undefined) query = query.lte("price_vnd", f.maxPrice);
    if (f.rating !== undefined) query = query.gte("rating_average", f.rating);
    if (f.duration.length) {
      query = query.or(
        f.duration
          .map((b) => `and(duration_seconds.gte.${DURATION_BUCKETS[b].min},duration_seconds.lt.${DURATION_BUCKETS[b].max})`)
          .join(","),
      );
    }
    const order: Record<CatalogFilters["sort"], [string, boolean]> = {
      popular: ["student_count", false],
      newest: ["published_at", false],
      rating: ["rating_average", false],
      "price-asc": ["price_vnd", true],
      "price-desc": ["price_vnd", false],
    };
    const [col, asc] = order[f.sort];
    const from = (f.page - 1) * PAGE_SIZE;
    const { data, count, error } = await query
      .order(col, { ascending: asc })
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const total = count ?? 0;
    return {
      items: (data as unknown as CardRow[]).map(toSummary),
      total,
      page: f.page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  },

  async all(): Promise<CourseSummary[]> {
    const client = await db();
    const { data, error } = await client.from("course_cards").select(CARD_COLUMNS).limit(500);
    if (error) throw error;
    return (data as unknown as CardRow[]).map(toSummary);
  },

  async bySlug(slug: string): Promise<CourseDetail | null> {
    const client = await db();
    const { data: card, error } = await client.from("course_cards").select(CARD_COLUMNS).eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!card) return null;
    const summary = toSummary(card as unknown as CardRow);

    const [course, sections, instructors, reviews] = await Promise.all([
      client.from("courses").select("description,language,updated_at,objectives,requirements,includes,preview_video_uid").eq("id", summary.id).single(),
      client
        .from("course_sections")
        .select("id,title,sort_order,lessons(id,title,lesson_type,duration_seconds,is_preview,sort_order)")
        .eq("course_id", summary.id)
        .order("sort_order"),
      client
        .from("course_instructors")
        .select("is_primary,instructor_profiles(user_id,slug,headline,biography,expertise,profiles(display_name,avatar_url))")
        .eq("course_id", summary.id),
      client
        .from("reviews")
        .select("id,rating,body,created_at,author_display_name,author_avatar_url")
        .eq("course_id", summary.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    if (course.error) throw course.error;

    type LessonRow = { id: string; title: string; lesson_type: LessonType; duration_seconds: number; is_preview: boolean; sort_order: number };
    type SectionRow = { id: string; title: string; lessons: LessonRow[] };
    type InstrRow = {
      instructor_profiles: {
        user_id: string; slug: string; headline: string; biography: string; expertise: string[];
        profiles: { display_name: string; avatar_url: string | null } | null;
      } | null;
    };
    type ReviewRow = { id: string; rating: number; body: string; created_at: string; author_display_name: string; author_avatar_url: string | null };

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as CourseDetail["ratingBreakdown"];
    const reviewRows = (reviews.data ?? []) as unknown as ReviewRow[];
    for (const r of reviewRows) breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
    const n = reviewRows.length || 1;
    for (const k of [1, 2, 3, 4, 5] as const) breakdown[k] = Math.round((breakdown[k] / n) * 100);

    return {
      ...summary,
      description: course.data.description,
      previewVideoUid: course.data.preview_video_uid ?? null,
      language: course.data.language === "vi" ? "Tiếng Việt" : course.data.language,
      updatedAt: course.data.updated_at,
      objectives: course.data.objectives ?? [],
      requirements: course.data.requirements ?? [],
      includes: course.data.includes ?? [],
      sections: ((sections.data ?? []) as unknown as SectionRow[]).map((s) => ({
        id: s.id,
        title: s.title,
        lessons: [...s.lessons]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({ id: l.id, title: l.title, type: l.lesson_type, durationSeconds: l.duration_seconds, isPreview: l.is_preview })),
      })),
      instructors: ((instructors.data ?? []) as unknown as InstrRow[])
        .filter((r) => r.instructor_profiles)
        .map(({ instructor_profiles: ip }) => ({
          id: ip!.user_id,
          slug: ip!.slug,
          name: ip!.profiles?.display_name ?? "",
          headline: ip!.headline,
          avatarUrl: ip!.profiles?.avatar_url ?? null,
          biography: ip!.biography,
          expertise: ip!.expertise,
          courseCount: 0,
          studentCount: 0,
          averageRating: 0,
        })),
      reviews: reviewRows.map((r) => ({
        id: r.id,
        authorName: r.author_display_name,
        authorHeadline: "",
        authorAvatarUrl: r.author_avatar_url,
        rating: r.rating,
        body: r.body,
        createdAt: r.created_at,
      })),
      ratingBreakdown: breakdown,
    };
  },

  async instructors(): Promise<Instructor[]> {
    const client = await db();
    const [{ data, error }, cards] = await Promise.all([
      client
        .from("instructor_profiles")
        .select("user_id,slug,headline,biography,expertise,profiles(display_name,avatar_url)")
        .eq("status", "active"),
      supabaseAdapter.all(),
    ]);
    if (error) throw error;
    type Row = { user_id: string; slug: string; headline: string; biography: string; expertise: string[]; profiles: { display_name: string; avatar_url: string | null } | null };
    return ((data ?? []) as unknown as Row[]).map((r) => {
      const mine = cards.filter((c) => c.instructor.id === r.user_id);
      const rated = mine.filter((c) => c.ratingCount > 0);
      return {
        id: r.user_id,
        slug: r.slug,
        name: r.profiles?.display_name ?? "",
        headline: r.headline,
        avatarUrl: r.profiles?.avatar_url ?? null,
        biography: r.biography,
        expertise: r.expertise,
        courseCount: mine.length,
        studentCount: mine.reduce((s, c) => s + c.studentCount, 0),
        averageRating: rated.length ? rated.reduce((s, c) => s + c.ratingAverage, 0) / rated.length : 0,
      };
    });
  },
};

const adapter = dataSource === "supabase" ? supabaseAdapter : demo;

/* ------------------------------- public API ------------------------------- */

export const getCategories = cache(() => adapter.categories());
export const searchCourses = (f: CatalogFilters) => adapter.search(f);
export const getCourseBySlug = cache((slug: string) => adapter.bySlug(slug));
export const getAllCourses = cache(() => adapter.all());
export const getInstructors = cache(() => adapter.instructors());

export async function getFeaturedCourses(limit = 8) {
  const all = await getAllCourses();
  return [...all].sort((a, b) => b.studentCount - a.studentCount).slice(0, limit);
}

export async function getNewestCourses(limit = 4) {
  const all = await getAllCourses();
  return [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
}

export async function getRelatedCourses(course: CourseSummary, limit = 4) {
  const all = await getAllCourses();
  return all
    .filter((c) => c.id !== course.id)
    .sort((a, b) => Number(b.category.slug === course.category.slug) - Number(a.category.slug === course.category.slug) || b.studentCount - a.studentCount)
    .slice(0, limit);
}

export async function getCatalogStats(): Promise<CatalogStats> {
  const [all, instructors, categories] = await Promise.all([getAllCourses(), getInstructors(), getCategories()]);
  return {
    publishedCourses: all.length,
    instructors: instructors.length,
    categories: categories.length,
    totalLessons: all.reduce((s, c) => s + c.lessonCount, 0),
  };
}

export interface FeaturedReview {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  courseTitle: string;
  courseSlug: string;
}

export const getFeaturedReviews = cache(async (limit = 3): Promise<FeaturedReview[]> => {
  if (dataSource === "demo") return [];
  const client = await db();
  const { data, error } = await client
    .from("reviews")
    .select("id,rating,body,author_display_name,author_avatar_url,courses(title,slug,status)")
    .eq("status", "published")
    .gte("rating", 4)
    .neq("body", "")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  type Row = { id: string; rating: number; body: string; author_display_name: string; author_avatar_url: string | null; courses: { title: string; slug: string } | null };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.courses)
    .map((r) => ({ id: r.id, authorName: r.author_display_name, authorAvatarUrl: r.author_avatar_url, rating: r.rating, body: r.body, courseTitle: r.courses!.title, courseSlug: r.courses!.slug }));
});
