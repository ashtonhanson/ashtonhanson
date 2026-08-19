"use client";

import { HomeDepthScene } from "@/components/HomeDepthScene";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { TitleShine } from "@/components/TitleShine";
import { home } from "@/lib/content";

export default function HomePage() {
  return (
    <HomeDepthScene
      aboutWord={home.aboutWord}
      meWord={home.meWord}
      aboutLines={home.aboutLines}
      gallery={
        <>
          <div className="relative z-10 mb-[clamp(0.75rem,2vh,1.25rem)] flex justify-center xl:mb-[clamp(1rem,2.5vh,1.75rem)]">
            <TitleShine className="pointer-events-none select-none text-center font-display text-[clamp(1.3rem,5.25vw,3rem)] font-black uppercase leading-[0.9] tracking-[0.04em] xl:text-[clamp(2rem,3.2vw,3.75rem)]">
              {home.recentWorkTitle}
            </TitleShine>
          </div>
          <ParallaxBlock title={home.aiAnimationTitle} motion={false}>
            <div className="mx-auto mt-2 w-full max-w-5xl xl:mt-4 xl:max-w-6xl 2xl:max-w-7xl">
              <MediaCarousel
                items={home.aiAnimations}
                label="AI animation gallery"
              />
            </div>
          </ParallaxBlock>
        </>
      }
      menu={<SeeMenuBlock cinematic />}
    />
  );
}
