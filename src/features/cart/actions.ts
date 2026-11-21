"use server";
import { z } from "zod";
import { getAllCourses } from "@/features/courses/repository";
import { priceCart, type CartQuote } from "./pricing";

const input = z.array(z.string().regex(/^[a-z0-9-]{3,120}$/)).max(50);

/** Server-side quote: the client sends slugs only; prices come from the database. */
export async function quoteCart(rawSlugs: unknown): Promise<CartQuote> {
  const parsed = input.safeParse(rawSlugs);
  if (!parsed.success) return priceCart([]);
  const slugs = [...new Set(parsed.data)];
  const all = await getAllCourses();
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const lines = slugs.flatMap((s) => {
    const c = bySlug.get(s);
    return c
      ? [{ slug: c.slug, title: c.title, thumbnailUrl: c.thumbnailUrl, instructorName: c.instructor.name, originalPriceVnd: c.compareAtPriceVnd ?? c.priceVnd, priceVnd: c.priceVnd }]
      : [];
  });
  return priceCart(lines, slugs.filter((s) => !bySlug.has(s)));
}
