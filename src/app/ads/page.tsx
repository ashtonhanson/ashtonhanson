import type { Metadata } from "next";
import { CaseStudy, withTravelOrders } from "@/components/CaseStudy";
import { PageIntro } from "@/components/PageIntro";
import { adCases, adCategories, adsIntro } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising and campaign design by Ashton Hanson Design.",
};

export default function AdsPage() {
  return (
    <>
      <PageIntro title="AD DESIGN" body={adsIntro} />

      <section className="border-t border-line px-5 py-14 md:px-8 xl:px-12 xl:py-16 2xl:px-16">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-4 xl:max-w-5xl xl:gap-x-14">
          {adCategories.map((category) => (
            <p
              key={category}
              className="font-display text-[0.78rem] font-semibold tracking-[0.22em] text-ink"
            >
              {category}
            </p>
          ))}
        </div>
      </section>

      <div className="divide-y divide-line border-t border-line">
        {withTravelOrders(adCases).map(({ study, travelOrder }) => (
          <CaseStudy key={study.id} study={study} travelOrder={travelOrder} />
        ))}
      </div>
    </>
  );
}
