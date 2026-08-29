"use client";

import type { ReactNode } from "react";
import { AboutIntroStage } from "@/components/AboutIntroStage";
import { ZHandoffChapter } from "@/components/ZHandoffChapter";
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
 * 2) RECENT WORK → AI ANIMATION → gallery — sequential Z-handoffs
 * 3) SEE MENU → FOR OTHER → WORK — same Z-scale as the intro
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

      <ZHandoffChapter
        itemCount={3}
        overlap={HOME_CHAPTER.overlapAbout}
        poseOffset={0}
        zIndex={12}
        stageClassName="!overflow-visible"
        aria-label="Recent work"
      >
        {gallery}
      </ZHandoffChapter>

      <ZHandoffChapter
        itemCount={4}
        overlap={HOME_CHAPTER.overlapGallery}
        poseOffset={3}
        zIndex={14}
        aria-label="See menu"
      >
        {menu}
      </ZHandoffChapter>
    </div>
  );
}
