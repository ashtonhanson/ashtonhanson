import { BodyCopy } from "@/components/BodyCopy";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { TitleShine } from "@/components/TitleShine";
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

      <section className="relative border-t border-line px-5 pb-[clamp(4.5rem,12vh,8rem)] pt-[clamp(3.5rem,9vh,5.5rem)] md:px-8">
        <div className="relative z-10 mb-[clamp(0.75rem,2vh,1.25rem)] flex justify-center">
          <TitleShine className="pointer-events-none select-none text-center font-display text-[clamp(1.3rem,5.25vw,3rem)] font-black uppercase leading-[0.9] tracking-[0.04em]">
            {home.recentWorkTitle}
          </TitleShine>
        </div>
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
