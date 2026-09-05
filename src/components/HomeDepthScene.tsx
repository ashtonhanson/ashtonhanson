"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AboutIntroStage } from "@/components/AboutIntroStage";
import { CinematicChapter } from "@/components/CinematicChapter";
import { LogoArrowCue } from "@/components/LogoArrowCue";
import { home } from "@/lib/content";
import { HOME_CHAPTER } from "@/lib/homeMotion";

/** Desktop mouse/trackpad only — tablets and phones keep the stacked line beats. */
const DESKTOP_INTRO_MQ = "(min-width: 1024px) and (pointer: fine)";

function subscribeDesktopIntro(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_INTRO_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function desktopIntroMatches() {
  return window.matchMedia(DESKTOP_INTRO_MQ).matches;
}

function useDesktopIntroLayout() {
  return useSyncExternalStore(
    subscribeDesktopIntro,
    desktopIntroMatches,
    () => false,
  );
}

type HomeDepthSceneProps = {
  aboutWord: string;
  meWord: string;
  aboutLines: string[];
  gallery: ReactNode;
  videos?: ReactNode;
  menu: ReactNode;
  Cue?: typeof LogoArrowCue;
};

/**
 * Home cinematic scroll:
 * 1) Sticky ABOUT intro
 * 2) RECENT WORK / AI ANIMATION — unique-angle enter, hold, scale-up exit
 * 3) Static AI clips
 * 4) SEE MENU / FOR OTHER / WORK
 */
export function HomeDepthScene({
  aboutWord,
  meWord,
  aboutLines,
  gallery,
  videos,
  menu,
  Cue,
}: HomeDepthSceneProps) {
  const desktopIntro = useDesktopIntroLayout();

  return (
    <div className="home-depth-scene">
      <AboutIntroStage
        aboutWord={aboutWord}
        meWord={meWord}
        bodyLines={desktopIntro ? [home.aboutParagraph] : aboutLines}
        bodyRotateLeft={desktopIntro}
        Cue={Cue}
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
        {gallery}
      </CinematicChapter>

      {videos}

      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={videos ? undefined : HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="hold"
        zIndex={14}
        perspective
        stageClassName="!overflow-visible"
        aria-label="See menu"
      >
        {menu}
      </CinematicChapter>
    </div>
  );
}
