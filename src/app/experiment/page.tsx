"use client";

import { AboutIntroStage } from "@/components/AboutIntroStage";
import { CinematicChapter } from "@/components/CinematicChapter";
import { MediaCarousel } from "@/components/MediaCarousel";
import { SeeMenuChapter } from "@/components/SeeMenuBlock";
import { TitleShine } from "@/components/TitleShine";
import { home } from "@/lib/content";
import { HOME_CHAPTER } from "@/lib/homeMotion";
import { LogoArrowCue } from "./LogoArrowCue";

export default function ExperimentPage() {
  return (
    <div className="home-depth-scene">
      <AboutIntroStage
        aboutWord={home.aboutWord}
        meWord={home.meWord}
        bodyLines={[home.aboutParagraph]}
        Cue={LogoArrowCue}
        bodyRotateLeft
      />
      <CinematicChapter
        pinHeight={HOME_CHAPTER.galleryPinVh}
        overlap={HOME_CHAPTER.overlapAbout}
        angleOffset={0}
        exitMode="scale"
        zIndex={12}
        perspective
        stageClassName="home-gallery-stage !overflow-visible"
        aria-label="Recent work"
      >
        <div className="home-gallery-lockup mx-auto flex w-full max-w-5xl flex-col items-center xl:max-w-6xl 2xl:max-w-7xl">
          <header className="mb-4 flex flex-col items-center text-center md:mb-8">
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
          <div
            data-home-arrive
            data-kind="media"
            data-index="2"
            className="pointer-events-auto w-full md:will-change-transform"
            style={{ opacity: 0, visibility: "hidden", transformOrigin: "50% 40%" }}
          >
            <MediaCarousel
              items={home.aiAnimations}
              label="AI animation gallery"
            />
          </div>
        </div>
      </CinematicChapter>
      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="hold"
        zIndex={14}
        perspective
        stageClassName="!overflow-visible"
        aria-label="See menu"
      >
        <SeeMenuChapter />
      </CinematicChapter>
    </div>
  );
}
