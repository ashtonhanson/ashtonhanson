import type { Metadata } from "next";
import { CaseStudy, withTravelOrders } from "@/components/CaseStudy";
import { PageIntro } from "@/components/PageIntro";
import { brandingCases, brandingIntro } from "@/lib/content";

export const metadata: Metadata = {
  title: "Branding",
  description: "Brand identity case studies by Ashton Hanson Design.",
};

export default function BrandingPage() {
  return (
    <>
      <PageIntro title="BRANDING" body={brandingIntro} />
      <div className="divide-y divide-line border-t border-line">
        {withTravelOrders(brandingCases).map(({ study, travelOrder }) => (
          <CaseStudy key={study.id} study={study} travelOrder={travelOrder} />
        ))}
      </div>
    </>
  );
}
