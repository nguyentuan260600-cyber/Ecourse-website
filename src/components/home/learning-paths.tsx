import Link from "next/link";
import { ArrowRight, Check, Code2, PenTool, Sparkles } from "lucide-react";
import type { LearningPath } from "@/features/learning-paths/repository";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

const ICONS = [Code2, Sparkles, PenTool];

export function LearningPaths({ paths }: { paths: LearningPath[] }) {
  if (!paths.length) return null;
  return (
    <section id="lo-trinh" className="container-page scroll-mt-24 py-14">
      <div className="rounded-[32px] bg-gradient-to-b from-surface to-surface-2/60 px-5 py-14 ring-1 ring-line/50 sm:px-10">
        <SectionHeading
          align="center"
          eyebrow="Định hướng nghề nghiệp"
          title="Lộ trình học cá nhân hoá cho sự nghiệp vượt trội"
          description="Không học dàn trải. Mỗi lộ trình được sắp xếp từ nền tảng vững chắc đến năng lực giải quyết bài toán phức tạp."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {paths.map((t, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const featured = t.isFeatured;
            return (
            <article
              key={t.id}
              className={cn(
                "relative flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]",
                featured ? "ring-2 ring-brand" : "ring-1 ring-line/60",
              )}
            >
              {featured ? (
                <span className="absolute -top-px right-6 rounded-b-lg bg-brand px-3 py-1 font-display text-[11px] font-bold text-white">Được quan tâm nhất</span>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold tracking-wider text-brand-strong uppercase">
                  Lộ trình {String(idx + 1).padStart(2, "0")}
                  {t.durationLabel ? ` • ${t.durationLabel}` : ""}
                </span>
                <Icon size={20} className="text-brand" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink">{t.title}</h3>
                {t.summary ? <p className="mt-1 text-sm text-ink-muted">{t.summary}</p> : null}
              </div>
              <ol className="flex flex-col gap-4">
                {t.steps.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        i === 0 ? "bg-success text-white" : i === 1 ? "bg-brand text-white" : "bg-surface-2 text-ink-muted",
                      )}
                      aria-hidden
                    >
                      {i === 0 ? <Check size={13} /> : i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Chặng {i + 1}: {s.title}
                      </p>
                      {s.detail ? <p className="text-xs text-ink-subtle">{s.detail}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
              {t.linkHref ? (
                <Link
                  href={t.linkHref}
                  className={cn(
                    "mt-auto inline-flex items-center justify-between rounded-xl px-4 py-3 font-display text-sm font-bold transition",
                    featured ? "bg-brand text-white hover:bg-brand-hover" : "bg-surface text-ink hover:bg-surface-2",
                  )}
                >
                  Xem khoá học trong lộ trình <ArrowRight size={16} aria-hidden />
                </Link>
              ) : null}
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
