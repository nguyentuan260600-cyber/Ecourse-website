import { SlidersHorizontal } from "lucide-react";
import type { CatalogFilters, Category } from "@/features/courses/types";
import { COURSE_LEVELS, DURATION_BUCKETS, LEVEL_LABEL } from "@/features/courses/types";
import { Stars } from "@/components/ui/rating";
import Link from "next/link";

const check = "h-4 w-4 rounded border-line-strong accent-[var(--brand)]";
const row = "flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-ink-muted hover:text-ink";

const PRICE_CAPS = [
  { v: "", l: "Tất cả mức giá" },
  { v: "1000000", l: "Dưới 1.000.000đ" },
  { v: "1500000", l: "Dưới 1.500.000đ" },
  { v: "2000000", l: "Dưới 2.000.000đ" },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line/70 pt-5 first:border-0 first:pt-0">
      <legend className="mb-2 font-display text-sm font-bold text-ink">{title}</legend>
      <div className="flex flex-col">{children}</div>
    </fieldset>
  );
}

export function FilterSidebar({ f, categories }: { f: CatalogFilters; categories: Category[] }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <SlidersHorizontal size={18} className="text-brand" aria-hidden /> Bộ lọc
        </h2>
        <Link href={f.q ? `/courses?q=${encodeURIComponent(f.q)}` : "/courses"} className="text-xs font-semibold text-brand-strong hover:underline">
          Xoá bộ lọc
        </Link>
      </div>

      <Group title="Danh mục">
        <label className={row}>
          <input type="radio" name="category" value="" defaultChecked={!f.category} className={check} /> Tất cả danh mục
        </label>
        {categories.map((c) => (
          <label key={c.slug} className={row}>
            <input type="radio" name="category" value={c.slug} defaultChecked={f.category === c.slug} className={check} />
            <span className="flex-1">{c.name}</span>
            <span className="text-xs text-ink-subtle">{c.courseCount}</span>
          </label>
        ))}
      </Group>

      <Group title="Cấp độ">
        {COURSE_LEVELS.map((l) => (
          <label key={l} className={row}>
            <input type="checkbox" name="level" value={l} defaultChecked={f.level.includes(l)} className={check} /> {LEVEL_LABEL[l]}
          </label>
        ))}
      </Group>

      <Group title="Học phí">
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          {[
            { v: "", l: "Tất cả" },
            { v: "free", l: "Miễn phí" },
            { v: "paid", l: "Có phí" },
          ].map((o) => (
            <label key={o.l} className="relative">
              <input type="radio" name="price" value={o.v} defaultChecked={(f.price ?? "") === o.v} className="peer sr-only" />
              <span className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-xs font-semibold text-ink-muted ring-1 ring-line transition peer-checked:bg-brand-soft peer-checked:text-brand-ink peer-checked:ring-brand/50 peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                {o.l}
              </span>
            </label>
          ))}
        </div>
        {PRICE_CAPS.map((p) => (
          <label key={p.l} className={row}>
            <input type="radio" name="maxPrice" value={p.v} defaultChecked={String(f.maxPrice ?? "") === p.v} className={check} /> {p.l}
          </label>
        ))}
      </Group>

      <Group title="Thời lượng">
        {Object.entries(DURATION_BUCKETS).map(([k, b]) => (
          <label key={k} className={row}>
            <input type="checkbox" name="duration" value={k} defaultChecked={f.duration.includes(k as never)} className={check} /> {b.label}
          </label>
        ))}
      </Group>

      <Group title="Đánh giá">
        {[
          { v: "", l: "Tất cả" },
          { v: "4.8", l: "4.8 trở lên" },
          { v: "4.5", l: "4.5 trở lên" },
          { v: "4", l: "4.0 trở lên" },
        ].map((r) => (
          <label key={r.l} className={row}>
            <input type="radio" name="rating" value={r.v} defaultChecked={String(f.rating ?? "") === r.v} className={check} />
            {r.v ? <Stars value={Number(r.v)} size={13} /> : null}
            {r.l}
          </label>
        ))}
      </Group>
      <noscript>
        <button type="submit" className="h-10 w-full rounded-xl bg-brand font-semibold text-white">
          Áp dụng
        </button>
      </noscript>
    </div>
  );
}
