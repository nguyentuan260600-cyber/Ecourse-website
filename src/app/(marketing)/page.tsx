import { CategoryBento } from "@/components/home/category-bento";
import { CtaNewsletter } from "@/components/home/cta-newsletter";
import { Faq, faqs } from "@/components/home/faq";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { Hero } from "@/components/home/hero";
import { InstructorHighlights } from "@/components/home/instructor-highlights";
import { LearningPaths } from "@/components/home/learning-paths";
import { Testimonials } from "@/components/home/testimonials";
import { HowItWorks, ValueProps } from "@/components/home/value-props";
import { getAllCourses, getCatalogStats, getCategories, getFeaturedReviews, getInstructors } from "@/features/courses/repository";
import { JsonLd } from "@/components/seo/json-ld";

export default async function HomePage() {
  const [stats, categories, courses, instructors, reviews] = await Promise.all([
    getCatalogStats(),
    getCategories(),
    getAllCourses(),
    getInstructors(),
    getFeaturedReviews(),
  ]);
  return (
    <>
      <Hero stats={stats} />
      <CategoryBento categories={categories} />
      <FeaturedCourses all={courses} />
      <LearningPaths />
      <ValueProps />
      <InstructorHighlights instructors={instructors} />
      <HowItWorks />
      <Testimonials reviews={reviews} />
      <Faq />
      <CtaNewsletter />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
