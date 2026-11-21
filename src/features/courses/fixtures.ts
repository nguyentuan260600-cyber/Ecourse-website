import "server-only";
import type { Category } from "./types";

/**
 * DEVELOPMENT-ONLY FIXTURES — used only when Supabase is not configured
 * (the UI then shows a "Dữ liệu mẫu" banner). Mirrors supabase/seed.sql.
 *
 * Only the category skeleton is provided. Courses, instructors and reviews are
 * intentionally empty: add real ones in Supabase.
 */
export const fixtureCategories: Category[] = [
  {
    id: "c-ai",
    slug: "lap-trinh-ai",
    name: "Lập trình & AI Engineering",
    description: "Kiến trúc Fullstack hiện đại, LLM, Vector Database và hạ tầng đám mây.",
    courseCount: 0,
    tags: ["Next.js", "Python", "LangChain"],
  },
  {
    id: "c-design",
    slug: "thiet-ke-san-pham",
    name: "Thiết kế UI/UX & Design System",
    description: "Design Token, Micro-interactions, chuẩn hoá quy trình bàn giao.",
    courseCount: 0,
    tags: ["Figma", "Design System"],
  },
  {
    id: "c-data",
    slug: "du-lieu",
    name: "Dữ liệu & Business Intelligence",
    description: "Phân tích dữ liệu, trực quan hoá và Machine Learning ứng dụng.",
    courseCount: 0,
    tags: ["SQL", "Pandas", "Power BI"],
  },
  {
    id: "c-business",
    slug: "kinh-doanh-quan-tri",
    name: "Quản trị sản phẩm & Kinh doanh",
    description: "Product Discovery, OKRs, Agile và tăng trưởng.",
    courseCount: 0,
    tags: ["OKRs", "Scrum", "Growth"],
  },
  {
    id: "c-cloud",
    slug: "cong-nghe-ha-tang",
    name: "DevOps, Cloud & Bảo mật",
    description: "Container, CI/CD, Kubernetes và an toàn ứng dụng web.",
    courseCount: 0,
    tags: ["Docker", "Kubernetes", "OWASP"],
  },
  {
    id: "c-lang",
    slug: "ngoai-ngu",
    name: "Ngoại ngữ cho dân công nghệ",
    description: "Tiếng Anh giao tiếp, thuyết trình kỹ thuật và phỏng vấn quốc tế.",
    courseCount: 0,
    tags: ["IELTS", "Tech English"],
  },
];
