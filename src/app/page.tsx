import { BodyCopy } from "@/components/BodyCopy";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { home } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-[clamp(3.5rem,10vh,6rem)] pt-[clamp(4.5rem,12vh,7rem)] md:px-8">
        <ParallaxBlock title={home.aboutTitle} as="h1">
          <div className="space-y-4">
            {home.about.map((paragraph) => (
              <BodyCopy
                key={paragraph}
                className="mx-auto max-w-2xl font-display text-[clamp(1.165rem,2.4vw,1.35rem)] font-normal leading-[1.65] tracking-[0.02em] text-foreground"
              >
                {paragraph}
              </BodyCopy>
            ))}
          </div>
        </ParallaxBlock>
      </section>

      <section className="relative overflow-hidden border-t border-line px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8">
        <ParallaxBlock title={home.recentWorkTitle}>
          <div className="h-[clamp(1rem,3vh,2rem)]" />
        </ParallaxBlock>
      </section>

      <section className="relative border-t border-line px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8">
        <ParallaxBlock title={home.aiAnimationTitle}>
          <div className="mx-auto mt-2 w-full max-w-5xl">
            <MediaCarousel
              items={home.aiAnimations}
              label="AI animation gallery"
            />
          </div>
        </ParallaxBlock>
      </section>

      <SeeMenuBlock />
    </>
  );
}
