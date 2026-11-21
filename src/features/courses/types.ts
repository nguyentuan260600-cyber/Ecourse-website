import { z } from "zod";

export const COURSE_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: "Người mới bắt đầu",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
  expert: "Chuyên gia",
};

export type LessonType = "video" | "text" | "document" | "quiz" | "assignment";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  courseCount: number;
  tags: string[];
}

export interface InstructorSummary {
  id: string;
  slug: string;
  name: string;
  headline: string;
  avatarUrl: string | null;
}

export interface Instructor extends InstructorSummary {
  biography: string;
  expertise: string[];
  courseCount: number;
  studentCount: number;
  averageRating: number;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  priceVnd: number;
  compareAtPriceVnd: number | null;
  level: CourseLevel;
  category: { slug: string; name: string };
  instructor: InstructorSummary;
  durationSeconds: number;
  lessonCount: number;
  ratingAverage: number;
  ratingCount: number;
  studentCount: number;
  badge: string | null;
  tags: string[];
  publishedAt: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: LessonType;
  durationSeconds: number;
  isPreview: boolean;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface Review {
  id: string;
  authorName: string;
  authorHeadline: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
}

export interface CourseDetail extends CourseSummary {
  description: string;
  language: string;
  updatedAt: string;
  objectives: { title: string; body: string }[];
  requirements: string[];
  includes: string[];
  sections: CurriculumSection[];
  instructors: Instructor[];
  reviews: Review[];
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

/* ---------- Catalog filters (parsed from URL search params) ---------- */

export const SORT_OPTIONS = {
  popular: "Phổ biến nhất",
  newest: "Mới nhất",
  rating: "Đánh giá cao",
  "price-asc": "Giá thấp → cao",
  "price-desc": "Giá cao → thấp",
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

export const DURATION_BUCKETS = {
  short: { label: "Dưới 5 giờ", min: 0, max: 5 * 3600 },
  medium: { label: "5 – 20 giờ", min: 5 * 3600, max: 20 * 3600 },
  long: { label: "20 – 50 giờ", min: 20 * 3600, max: 50 * 3600 },
  xl: { label: "Trên 50 giờ", min: 50 * 3600, max: Number.MAX_SAFE_INTEGER },
} as const;
export type DurationBucket = keyof typeof DURATION_BUCKETS;

export const PAGE_SIZE = 9;

const csv = <T extends string>(allowed: readonly T[]) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      const raw = Array.isArray(v) ? v.join(",") : (v ?? "");
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is T => (allowed as readonly string[]).includes(s));
    });

const single = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const catalogFiltersSchema = z.object({
  q: z.preprocess(single, z.string().trim().max(100).optional()).catch(undefined),
  category: z.preprocess(single, z.string().regex(/^[a-z0-9-]+$/).max(80).optional()).catch(undefined),
  level: csv(COURSE_LEVELS),
  duration: csv(Object.keys(DURATION_BUCKETS) as DurationBucket[]),
  price: z.preprocess(single, z.enum(["free", "paid"]).optional()).catch(undefined),
  maxPrice: z.preprocess(single, z.coerce.number().int().min(0).max(100_000_000).optional()).catch(undefined),
  rating: z.preprocess(single, z.coerce.number().min(0).max(5).optional()).catch(undefined),
  sort: z
    .preprocess(single, z.enum(Object.keys(SORT_OPTIONS) as [SortOption, ...SortOption[]]))
    .catch("popular" as SortOption),
  page: z.preprocess(single, z.coerce.number().int().min(1).max(1000)).catch(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

export interface CatalogResult {
  items: CourseSummary[];
  total: number;
  page: number;
  pageCount: number;
}
