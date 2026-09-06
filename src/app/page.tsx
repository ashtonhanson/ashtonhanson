"use client";

import { HomeDepthScene } from "@/components/HomeDepthScene";
import { HomeVideos } from "@/components/HomeVideos";
import { LogoArrowCue } from "@/components/LogoArrowCue";
import { SeeMenuChapter } from "@/components/SeeMenuBlock";
import { TitleShine } from "@/components/TitleShine";
import { home } from "@/lib/content";

export default function HomePage() {
  return (
    <HomeDepthScene
      aboutWord={home.aboutWord}
      meWord={home.meWord}
      aboutLines={home.aboutLines}
      Cue={LogoArrowCue}
      gallery={
        <div className="home-gallery-lockup mx-auto flex w-full max-w-3xl flex-col items-center xl:max-w-4xl">
          <header className="relative z-10 mb-6 flex flex-col items-center text-center md:mb-10">
            <div
              data-home-arrive
              data-kind="copy"
              data-index="0"
              className="will-change-transform"
              style={{ opacity: 0, visibility: "hidden", transformOrigin: "50% 50%" }}
            >
              <TitleShine className="pointer-events-none select-none font-display text-[clamp(0.72rem,2.2vw,0.95rem)] font-semibold uppercase leading-none tracking-[0.28em] xl:text-[0.95rem]">
                {home.recentWorkTitle}
              </TitleShine>
            </div>
            <div
              data-home-arrive
              data-kind="title"
              data-index="1"
              className="mt-3 will-change-transform"
              style={{ opacity: 0, visibility: "hidden", transformOrigin: "50% 50%" }}
            >
              <TitleShine
                as="h2"
                className="pointer-events-none select-none whitespace-nowrap font-display text-[clamp(1.7rem,5.8vw,4.25rem)] font-black uppercase leading-none tracking-[0.06em] max-[420px]:whitespace-normal max-[420px]:leading-[0.86] xl:text-[clamp(2.75rem,4.4vw,4.75rem)]"
              >
                {home.aiAnimationTitle}
              </TitleShine>
            </div>
          </header>
          <HomeVideos items={home.aiAnimations} />
        </div>
      }
      menu={<SeeMenuChapter />}
    />
  );
}
