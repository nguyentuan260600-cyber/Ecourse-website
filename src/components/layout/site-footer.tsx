import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "./logo";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { getCategories } from "@/features/courses/repository";

const staticColumns = [
  {
    title: "Khai Sáng",
    links: [
      { href: "/instructors", label: "Đội ngũ giảng viên" },
      { href: "/categories", label: "Tất cả danh mục" },
      { href: "/certificates/verify", label: "Xác thực chứng chỉ" },
      { href: "/#faq", label: "Câu hỏi thường gặp" },
    ],
  },
];

export async function SiteFooter() {
  const categories = await getCategories().catch(() => []);
  const columns = [
    {
      title: "Chương trình học",
      links: [
        { href: "/courses", label: "Tất cả khoá học" },
        ...categories.slice(0, 5).map((c) => ({ href: `/courses?category=${c.slug}`, label: c.name })),
        { href: "/courses?price=free", label: "Khoá học miễn phí" },
      ],
    },
    ...staticColumns,
  ];
  return (
    <footer className="mt-24 border-t border-line/70 bg-card">
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div className="flex flex-col gap-5">
          <Logo withTagline={false} />
          <p className="max-w-sm text-sm leading-6 text-ink-muted">{siteConfig.description}</p>
          <div>
            <p className="mb-2 font-display text-sm font-semibold text-ink">Nhận cẩm nang học tập hằng tuần</p>
            <NewsletterForm compact />
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 font-display text-sm font-bold text-ink">{col.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-muted transition hover:text-brand-strong">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="mb-4 font-display text-sm font-bold text-ink">Hỗ trợ & liên hệ</h2>
          <ul className="flex flex-col gap-3 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand" aria-hidden /> Hotline: <strong className="text-ink">{siteConfig.hotline}</strong>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-brand" aria-hidden />
              <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-brand-strong">
                {siteConfig.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden /> Việt Nam
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span>Thanh toán an toàn qua</span>
            {["PayOS", "VietQR", "Thẻ ngân hàng"].map((p) => (
              <span key={p} className="rounded-md bg-surface px-2 py-1 font-semibold text-ink-muted ring-1 ring-line">
                {p}
              </span>
            ))}
          </div>
          <p>© {new Date().getFullYear()} Khai Sáng. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
