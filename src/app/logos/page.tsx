import type { Metadata } from "next";
import { CaseStudy, withTravelOrders } from "@/components/CaseStudy";
import { PageIntro } from "@/components/PageIntro";
import { logoCases, logosIntro } from "@/lib/content";

export const metadata: Metadata = {
  title: "Logos",
  description: "Logo design work by Ashton Hanson Design.",
};

export default function LogosPage() {
  return (
    <>
      <PageIntro title="LOGO WORK" body={logosIntro} />
      <div className="divide-y divide-line border-t border-line">
        {withTravelOrders(logoCases).map(({ study, travelOrder }) => (
          <CaseStudy key={study.id} study={study} travelOrder={travelOrder} />
        ))}
      </div>
    </>
  );
}
