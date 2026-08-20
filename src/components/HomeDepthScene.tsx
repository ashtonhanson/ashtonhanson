"use client";

import type { ReactNode } from "react";
import { AboutIntroStage } from "@/components/AboutIntroStage";
import { CinematicChapter } from "@/components/CinematicChapter";
import { HOME_CHAPTER } from "@/lib/homeMotion";

type HomeDepthSceneProps = {
  aboutWord: string;
  meWord: string;
  aboutLines: string[];
  gallery: ReactNode;
  menu: ReactNode;
};

/**
 * Home cinematic scroll:
 * 1) Sticky ABOUT intro
 * 2) RECENT WORK / AI ANIMATION / gallery — unique-angle enter, hold, scale-up exit
 * 3) SEE MENU / FOR OTHER / WORK — same treatment
 */
export function HomeDepthScene({
  aboutWord,
  meWord,
  aboutLines,
  gallery,
  menu,
}: HomeDepthSceneProps) {
  return (
    <div className="home-depth-scene">
      <AboutIntroStage
        aboutWord={aboutWord}
        meWord={meWord}
        bodyLines={aboutLines}
      />

      <CinematicChapter
        pinHeight={HOME_CHAPTER.galleryPinVh}
        overlap={HOME_CHAPTER.overlapAbout}
        angleOffset={0}
        exitMode="scale"
        zIndex={12}
        perspective
        aria-label="Recent work"
      >
        {gallery}
      </CinematicChapter>

      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="shrink"
        zIndex={14}
        aria-label="See menu"
      >
        {menu}
      </CinematicChapter>
    </div>
  );
}
