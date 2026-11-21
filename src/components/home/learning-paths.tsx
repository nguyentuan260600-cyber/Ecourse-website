import Link from "next/link";
import { ArrowRight, Check, Code2, PenTool, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

const tracks = [
  {
    icon: Code2,
    label: "Lộ trình 01 • khoảng 6 tháng",
    title: "Frontend đến Fullstack Architect",
    body: "Từ dựng giao diện đến làm chủ hạ tầng, API, caching và mở rộng hệ thống.",
    steps: [
      { t: "TypeScript & quản lý state hiện đại", d: "React, Next.js, React Query" },
      { t: "Cơ sở dữ liệu & backend", d: "PostgreSQL, Redis, thiết kế API" },
      { t: "DevOps & kiến trúc hệ thống", d: "Docker, CI/CD, Kubernetes" },
    ],
    href: "/courses?category=lap-trinh-ai",
  },
  {
    icon: Sparkles,
    label: "Lộ trình 02 • khoảng 7 tháng",
    title: "AI Application Engineer",
    body: "Dành cho lập trình viên muốn xây dựng sản phẩm thật với mô hình ngôn ngữ lớn.",
    steps: [
      { t: "Python & toán nền tảng cho AI", d: "NumPy, đại số tuyến tính, xác suất" },
      { t: "LangChain, RAG & Vector DB", d: "Embeddings, chunking, hybrid search" },
      { t: "Agent & vận hành mô hình", d: "Tool calling, đánh giá, guardrails" },
    ],
    href: "/courses?q=AI",
    featured: true,
  },
  {
    icon: PenTool,
    label: "Lộ trình 03 • khoảng 5 tháng",
    title: "Senior Product Designer",
    body: "Kết nối chiến lược kinh doanh và trải nghiệm người dùng bằng quy trình bài bản.",
    steps: [
      { t: "Design System nâng cao", d: "Auto-layout, biến, token" },
      { t: "Nghiên cứu & kiểm thử người dùng", d: "User journey, usability testing" },
      { t: "Chỉ số sản phẩm & bàn giao", d: "Đo lường, phối hợp với kỹ sư" },
    ],
    href: "/courses?category=thiet-ke-san-pham",
  },
];

export function LearningPaths() {
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
          {tracks.map((t) => (
            <article
              key={t.title}
              className={cn(
                "relative flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]",
                t.featured ? "ring-2 ring-brand" : "ring-1 ring-line/60",
              )}
            >
              {t.featured ? (
                <span className="absolute -top-px right-6 rounded-b-lg bg-brand px-3 py-1 font-display text-[11px] font-bold text-white">Được quan tâm nhất</span>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold tracking-wider text-brand-strong uppercase">{t.label}</span>
                <t.icon size={20} className="text-brand" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink">{t.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{t.body}</p>
              </div>
              <ol className="flex flex-col gap-4">
                {t.steps.map((s, i) => (
                  <li key={s.t} className="flex gap-3">
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
                        Chặng {i + 1}: {s.t}
                      </p>
                      <p className="text-xs text-ink-subtle">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href={t.href}
                className={cn(
                  "mt-auto inline-flex items-center justify-between rounded-xl px-4 py-3 font-display text-sm font-bold transition",
                  t.featured ? "bg-brand text-white hover:bg-brand-hover" : "bg-surface text-ink hover:bg-surface-2",
                )}
              >
                Xem khoá học trong lộ trình <ArrowRight size={16} aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
