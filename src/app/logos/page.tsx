import type { Metadata } from "next";
import { BodyCopy } from "@/components/BodyCopy";
import { LogoPlate } from "@/components/LogoPlate";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { withTravelOrders } from "@/components/CaseStudy";
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
        {withTravelOrders(logoCases).map(({ study }) => {
          const plate = study.media?.[0];
          return (
            <article
              key={study.id}
              id={study.id}
              className="relative px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8 xl:px-12 xl:py-[clamp(5.5rem,13vh,11rem)] 2xl:px-16"
            >
              <ParallaxBlock title={study.title} subtitle={study.subtitle}>
                <div className="relative">
                  <BodyCopy className="relative z-10 mx-auto max-w-2xl font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.75] tracking-[0.01em] text-foreground xl:max-w-3xl xl:text-[clamp(1.2rem,1.35vw,1.4rem)]">
                    {study.body}
                  </BodyCopy>
                  {plate ? <LogoPlate src={plate.src} alt={plate.alt} /> : null}
                </div>
              </ParallaxBlock>
            </article>
          );
        })}
      </div>
    </>
  );
}
