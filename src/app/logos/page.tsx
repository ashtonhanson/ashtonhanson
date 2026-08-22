import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { CinematicChapter } from "@/components/CinematicChapter";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { logoCases, logosIntroLines } from "@/lib/content";
import { HOME_CHAPTER } from "@/lib/homeMotion";

export const metadata: Metadata = {
  title: "Logos",
  description: "Logo design work by Ashton Hanson Design.",
};

export default function LogosPage() {
  return (
    <>
      <BrandingScene
        introTitle="LOGOS"
        introLines={logosIntroLines}
        cases={logoCases}
        mediaVariant="plate"
      />
      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="hold"
        zIndex={14}
        aria-label="See menu"
      >
        <SeeMenuBlock cinematic />
      </CinematicChapter>
    </>
  );
}
