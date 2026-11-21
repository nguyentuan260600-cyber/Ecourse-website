import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DemoBanner } from "@/components/ui/demo-banner";
import { dataSource } from "@/features/courses/repository";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {dataSource === "demo" ? <DemoBanner /> : null}
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
