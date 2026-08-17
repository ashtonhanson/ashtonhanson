import type { CaseStudy as CaseStudyType } from "@/lib/content";
import { BodyCopy } from "@/components/BodyCopy";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { TravelSubtitle } from "@/components/TravelSubtitle";

type CaseStudyProps = {
  study: CaseStudyType;
  /** Global order index for this study’s main subtitle; sections continue after. */
  travelOrder?: number;
};

/** Even indexes: left→right. Odd indexes: right→left. */
function isReversed(order: number) {
  return Math.abs(order) % 2 === 1;
}

/** Assign sequential travel-order indexes across a list of case studies. */
export function withTravelOrders<T extends { sections?: unknown[] }>(
  cases: T[],
): { study: T; travelOrder: number }[] {
  let order = 0;
  return cases.map((study) => {
    const travelOrder = order;
    order += 1 + (study.sections?.length ?? 0);
    return { study, travelOrder };
  });
}

export function CaseStudy({ study, travelOrder = 0 }: CaseStudyProps) {
  return (
    <article
      id={study.id}
      className="relative px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8"
    >
      <ParallaxBlock
        title={study.title}
        subtitle={study.subtitle}
        subtitleReverse={isReversed(travelOrder)}
      >
        <BodyCopy className="mx-auto max-w-2xl font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.75] tracking-[0.01em] text-foreground">
          {study.body}
        </BodyCopy>

        {study.media?.length ? (
          <div className="mx-auto mt-12 w-full max-w-5xl">
            <MediaCarousel
              items={study.media}
              label={`${study.title} gallery`}
            />
          </div>
        ) : null}
      </ParallaxBlock>

      {study.sections?.map((section, index) => {
        const order = travelOrder + 1 + index;
        const reverse = isReversed(order);
        return (
          <div key={section.heading} className="mt-16">
            <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-5">
              <div className="flex justify-center py-1">
                <TravelSubtitle reverse={reverse} as="h4">
                  {section.heading}
                </TravelSubtitle>
              </div>
            </div>
            {section.media?.length ? (
              <div className="mx-auto mt-8 w-full max-w-5xl">
                <MediaCarousel
                  items={section.media}
                  label={`${section.heading} gallery`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </article>
  );
}
