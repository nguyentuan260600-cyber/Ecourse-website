export const siteConfig = {
  name: "Khai Sáng",
  tagline: "Khai Phóng Tri Thức Số",
  description:
    "Nền tảng học trực tuyến cho kỹ sư phần mềm, designer, chuyên gia AI và nhà quản lý — giáo trình thực chiến, giảng viên giàu kinh nghiệm, chứng chỉ có thể xác thực.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "vi_VN",
  supportEmail: "hotro@khaisang.edu.vn",
  hotline: "1900 8899",
} as const;

export const mainNav = [
  { href: "/courses", label: "Khám phá" },
  { href: "/categories", label: "Danh mục" },
  { href: "/instructors", label: "Giảng viên" },
  { href: "/#faq", label: "Hỏi đáp" },
] as const;
