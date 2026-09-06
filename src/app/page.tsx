"use client";

import { HomeDepthScene } from "@/components/HomeDepthScene";
import { HomeVideos } from "@/components/HomeVideos";
import { LogoArrowCue } from "@/components/LogoArrowCue";
import { SeeMenuChapter } from "@/components/SeeMenuBlock";
import { home } from "@/lib/content";

export default function HomePage() {
  return (
    <HomeDepthScene
      aboutWord={home.aboutWord}
      meWord={home.meWord}
      aboutLines={home.aboutLines}
      Cue={LogoArrowCue}
      videos={
        <HomeVideos
          items={home.aiAnimations}
          kicker={home.recentWorkTitle}
          title={home.aiAnimationTitle}
        />
      }
      menu={<SeeMenuChapter />}
    />
  );
}
