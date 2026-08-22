import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { CinematicChapter } from "@/components/CinematicChapter";
import { SeeMenuBlock } from "@/components/SeeMenuBlock";
import { adCases, adCategories, adsIntroLines } from "@/lib/content";
import { HOME_CHAPTER } from "@/lib/homeMotion";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising and campaign design by Ashton Hanson Design.",
};

export default function AdsPage() {
  return (
    <>
      <BrandingScene
        introTitle="ADS"
        introLines={adsIntroLines}
        introTags={adCategories}
        cases={adCases}
      />
      <CinematicChapter
        pinHeight={HOME_CHAPTER.menuPinVh}
        overlap={HOME_CHAPTER.overlapGallery}
        angleOffset={4}
        exitMode="hold"
        zIndex={14}
        perspective
        aria-label="See menu"
      >
        <SeeMenuBlock cinematic />
      </CinematicChapter>
    </>
  );
}
