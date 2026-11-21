import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/features/courses/repository";

export const metadata: Metadata = { title: "Danh mục khoá học", alternates: { canonical: "/categories" } };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Danh mục khoá học</h1>
      <p className="mt-2 text-ink-muted">Chọn lĩnh vực bạn muốn phát triển.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/courses?category=${c.slug}`} className="group flex h-full flex-col gap-3 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
              <span className="text-xs font-semibold text-ink-subtle">{c.courseCount} khoá học</span>
              <h2 className="text-xl font-bold text-ink group-hover:text-brand-strong">{c.name}</h2>
              <p className="flex-1 text-sm text-ink-muted">{c.description}</p>
              <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-brand-strong">
                Xem khoá học <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
