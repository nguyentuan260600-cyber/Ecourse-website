import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";
import type { CourseSummary } from "@/features/courses/types";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseTabs } from "./course-tabs";
import { SectionHeading } from "./section-heading";

function Grid({ items }: { items: CourseSummary[] }) {
  if (!items.length) return <EmptyState icon={<Library size={26} />} title="Chưa có khoá học" description="Khoá học sẽ xuất hiện tại đây khi được xuất bản." />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}

export function FeaturedCourses({ all }: { all: CourseSummary[] }) {
  const byStudents = [...all].sort((a, b) => b.studentCount - a.studentCount);
  const tabs = [
    { key: "popular", label: "Thịnh hành nhất", items: byStudents.slice(0, 4) },
    { key: "new", label: "Mới xuất bản", items: [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4) },
    { key: "rating", label: "Đánh giá cao", items: [...all].sort((a, b) => b.ratingAverage - a.ratingAverage).slice(0, 4) },
    {
      key: "deal",
      label: "Ưu đãi tốt",
      items: all
        .filter((c) => c.compareAtPriceVnd && c.compareAtPriceVnd > c.priceVnd)
        .sort((a, b) => b.compareAtPriceVnd! - b.priceVnd - (a.compareAtPriceVnd! - a.priceVnd))
        .slice(0, 4),
    },
    { key: "free", label: "Miễn phí", items: all.filter((c) => c.priceVnd === 0).slice(0, 4) },
  ];
  return (
    <section id="khoa-hoc" className="container-page py-14">
      <SectionHeading
        eyebrow="Chương trình tuyển chọn"
        icon={<Library size={16} aria-hidden />}
        title="Khoá học tiêu biểu"
        action={
          <Link href="/courses" className="inline-flex items-center gap-1 font-display text-sm font-bold text-brand-strong hover:underline">
            Xem tất cả khoá học <ArrowRight size={16} aria-hidden />
          </Link>
        }
      />
      <CourseTabs
        tabs={tabs.map(({ key, label }) => ({ key, label }))}
        renderPanels={Object.fromEntries(tabs.map((t) => [t.key, <Grid key={t.key} items={t.items} />]))}
      />
    </section>
  );
}
