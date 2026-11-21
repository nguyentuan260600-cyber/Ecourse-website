import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllCourses, getCategories } from "@/features/courses/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, categories] = await Promise.all([getAllCourses().catch(() => []), getCategories().catch(() => [])]);
  const u = (p: string) => `${siteConfig.url}${p}`;
  return [
    { url: u("/"), changeFrequency: "daily", priority: 1 },
    { url: u("/courses"), changeFrequency: "daily", priority: 0.9 },
    { url: u("/categories"), changeFrequency: "weekly", priority: 0.6 },
    { url: u("/instructors"), changeFrequency: "weekly", priority: 0.6 },
    ...categories.map((c) => ({ url: u(`/courses?category=${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...courses.map((c) => ({ url: u(`/courses/${c.slug}`), lastModified: c.publishedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
