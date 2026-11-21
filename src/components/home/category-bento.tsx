import Link from "next/link";
import { ArrowRight, Flame, Shapes } from "lucide-react";
import type { Category } from "@/features/courses/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

const spans = ["lg:col-span-8", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4", "lg:col-span-12"];

export function CategoryBento({ categories }: { categories: Category[] }) {
  const [first, ...rest] = categories;
  if (!first) return null;
  return (
    <section className="container-page py-14" aria-labelledby="cat-title">
      <SectionHeading
        eyebrow="Khung năng lực trọng điểm"
        icon={<Shapes size={16} aria-hidden />}
        title="Danh mục kỹ năng đột phá"
        description="Chương trình được thiết kế theo nhu cầu tuyển dụng thực tế, từ nền tảng đến chuyên sâu."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
        <Link
          href={`/courses?category=${first.slug}`}
          className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60 transition hover:shadow-[var(--shadow-lift)] md:col-span-2 lg:col-span-8"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone="accent">
                  <Flame size={12} aria-hidden /> Xu hướng
                </Badge>
                <span className="text-xs font-semibold text-ink-subtle">{first.courseCount} khoá học</span>
              </div>
              <h3 id="cat-title" className="text-2xl font-bold text-ink">
                {first.name}
              </h3>
              <p className="mt-1 max-w-md text-sm text-ink-muted">{first.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {first.tags.map((t) => (
                <span key={t} className="rounded-lg bg-surface-2 px-2.5 py-1 font-mono text-[11px] font-semibold text-ink">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div aria-hidden className="rounded-2xl bg-[#131b2e] p-4 font-mono text-[12px] leading-6 text-[#c5c0ff] shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-white/50">
              <span>agent_orchestrator.ts</span>
              <span className="text-[#6ffbbe]">● Đang chạy</span>
            </div>
            <p>
              <span className="text-[#f8bc63]">async function</span> <span className="text-white">answer</span>(question) {"{"}
            </p>
            <p className="pl-4">
              <span className="text-[#f8bc63]">const</span> docs = <span className="text-[#f8bc63]">await</span> vectorStore.search(question, {"{"} k: 5 {"}"})
            </p>
            <p className="pl-4">
              <span className="text-[#f8bc63]">return</span> llm.generate({"{"} question, context: docs {"}"})
            </p>
            <p>{"}"}</p>
          </div>
          <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-brand-strong">
            Khám phá {first.courseCount} khoá học <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>

        {rest.map((c, i) => (
          <Link
            key={c.id}
            href={`/courses?category=${c.slug}`}
            className={cn(
              "group flex flex-col justify-between gap-6 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
              spans[i + 1] ?? "lg:col-span-4",
            )}
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="neutral">{c.tags[0] ?? "Kỹ năng"}</Badge>
                <span className="text-xs font-semibold text-ink-subtle">{c.courseCount} khoá học</span>
              </div>
              <h3 className="text-xl font-bold text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
            </div>
            <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-brand-strong">
              Xem khoá học <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
