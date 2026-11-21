import { ChevronDown, FileText, HelpCircle, Lock, PlayCircle } from "lucide-react";
import type { CurriculumSection, LessonType } from "@/features/courses/types";
import { formatClock, formatDuration } from "@/lib/utils/format";
import { PreviewLessonButton } from "./preview-lesson-button";

const ICON: Record<LessonType, typeof PlayCircle> = { video: PlayCircle, text: FileText, document: FileText, quiz: HelpCircle, assignment: FileText };

export function Curriculum({ sections }: { sections: CurriculumSection[] }) {
  const lessons = sections.reduce((n, s) => n + s.lessons.length, 0);
  const secs = sections.reduce((n, s) => n + s.lessons.reduce((m, l) => m + l.durationSeconds, 0), 0);
  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">
        {sections.length} chương • {lessons} bài học • {formatDuration(secs)} tổng thời lượng
      </p>
      <div className="flex flex-col gap-3">
        {sections.map((s, i) => {
          const dur = s.lessons.reduce((m, l) => m + l.durationSeconds, 0);
          const hasPreview = s.lessons.some((l) => l.isPreview);
          return (
            <details key={s.id} open={i === 0} className="group rounded-2xl bg-card ring-1 ring-line/70 open:shadow-[var(--shadow-soft)]">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-display text-xs font-bold text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold text-ink">{s.title}</span>
                  <span className="text-xs text-ink-subtle">
                    {s.lessons.length} bài học • {formatDuration(dur)}
                  </span>
                </span>
                {hasPreview ? <span className="hidden rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-bold text-success-ink sm:inline">Có bài học thử</span> : null}
                <ChevronDown size={18} className="shrink-0 text-ink-subtle transition group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="border-t border-line/70 px-3 py-2">
                {s.lessons.map((l) => {
                  const Icon = l.isPreview ? ICON[l.type] : Lock;
                  return (
                    <li key={l.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm">
                      <Icon size={16} className={l.isPreview ? "text-brand" : "text-ink-subtle"} aria-label={l.isPreview ? "Học thử" : "Cần đăng ký"} />
                      <span className="flex-1 text-ink-muted">{l.title}</span>
                      {l.type === "quiz" ? <span className="text-[11px] font-semibold text-accent-ink">Quiz</span> : null}
                      {l.isPreview ? <PreviewLessonButton lessonId={l.id} title={l.title} /> : null}
                      <span className="w-12 text-right text-xs text-ink-subtle tabular-nums">{formatClock(l.durationSeconds)}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
