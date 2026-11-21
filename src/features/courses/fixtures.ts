import "server-only";
import type { Category } from "./types";

/**
 * DEVELOPMENT-ONLY demo data, used only when Supabase is not configured.
 * Intentionally empty: categories, courses, instructors and reviews are
 * added for real in Supabase.
 */
export const fixtureCategories: Category[] = [];
