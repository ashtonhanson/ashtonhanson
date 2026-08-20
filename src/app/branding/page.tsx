import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { CinematicChapter } from "@/components/CinematicChapter";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { brandingCases, brandingIntroLines } from "@/lib/content";
import { HOME_CHAPTER } from "@/lib/homeMotion";

export const metadata: Metadata = {
  title: "Branding",
  description: "Brand identity case studies by Ashton Hanson Design.",
};

export default function BrandingPage() {
  return (
    <>
      <BrandingScene
        introTitle="BRANDING"
        introLines={brandingIntroLines}
        cases={brandingCases}
      />
      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="shrink"
        zIndex={14}
        aria-label="See menu"
      >
        <SeeMenuBlock cinematic />
      </CinematicChapter>
    </>
  );
}
