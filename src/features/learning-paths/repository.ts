import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationLabel: string;
  linkHref: string | null;
  isFeatured: boolean;
  steps: { id: string; title: string; detail: string }[];
}

/** Published learning paths (RLS hides drafts from non-admins). Empty without Supabase. */
export const getLearningPaths = cache(async (): Promise<LearningPath[]> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("learning_paths")
    .select("id,slug,title,summary,duration_label,link_href,is_featured,sort_order,learning_path_steps(id,title,detail,sort_order)")
    .eq("status", "published")
    .order("sort_order");
  if (error) throw error;
  type Row = {
    id: string; slug: string; title: string; summary: string; duration_label: string; link_href: string | null; is_featured: boolean;
    learning_path_steps: { id: string; title: string; detail: string; sort_order: number }[];
  };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    durationLabel: r.duration_label,
    linkHref: r.link_href,
    isFeatured: r.is_featured,
    steps: [...r.learning_path_steps].sort((a, b) => a.sort_order - b.sort_order).map(({ id, title, detail }) => ({ id, title, detail })),
  }));
});
