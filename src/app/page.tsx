import { BodyCopy } from "@/components/BodyCopy";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { TitleShine } from "@/components/TitleShine";
import { home } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-[clamp(3.5rem,10vh,6rem)] pt-[clamp(4.5rem,12vh,7rem)] md:px-8 xl:px-12 xl:pb-[clamp(4.5rem,11vh,8rem)] xl:pt-[clamp(5.5rem,13vh,9rem)] 2xl:px-16">
        <ParallaxBlock title={home.aboutTitle} as="h1">
          <div className="space-y-4 xl:space-y-5">
            {home.about.map((paragraph) => (
              <BodyCopy
                key={paragraph}
                className="mx-auto max-w-2xl font-display text-[clamp(1.165rem,2.4vw,1.35rem)] font-normal leading-[1.65] tracking-[0.02em] text-foreground xl:max-w-3xl xl:text-[clamp(1.25rem,1.4vw,1.5rem)]"
              >
                {paragraph}
              </BodyCopy>
            ))}
          </div>
        </ParallaxBlock>
      </section>

      <section className="relative border-t border-line px-5 pb-[clamp(4.5rem,12vh,8rem)] pt-[clamp(3.5rem,9vh,5.5rem)] md:px-8 xl:px-12 xl:pb-[clamp(5.5rem,13vh,11rem)] xl:pt-[clamp(4.25rem,10vh,7rem)] 2xl:px-16">
        <div className="relative z-10 mb-[clamp(0.75rem,2vh,1.25rem)] flex justify-center xl:mb-[clamp(1rem,2.5vh,1.75rem)]">
          <TitleShine className="pointer-events-none select-none text-center font-display text-[clamp(1.3rem,5.25vw,3rem)] font-black uppercase leading-[0.9] tracking-[0.04em] xl:text-[clamp(2rem,3.2vw,3.75rem)]">
            {home.recentWorkTitle}
          </TitleShine>
        </div>
        <ParallaxBlock title={home.aiAnimationTitle}>
          <div className="mx-auto mt-2 w-full max-w-5xl xl:mt-4 xl:max-w-6xl 2xl:max-w-7xl">
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
