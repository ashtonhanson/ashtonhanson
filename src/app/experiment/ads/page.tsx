"use client";

import { BrandingScene } from "@/components/BrandingScene";
import { adCases, adCategories, adsIntro } from "@/lib/content";
import { LogoArrowCue } from "../LogoArrowCue";

export default function ExperimentAdsPage() {
  return (
    <BrandingScene
      introTitle="ADS"
      introLines={[adsIntro]}
      introTags={adCategories}
      cases={adCases}
      menu
      adsMotion
      introBodyLowerExit
      Cue={LogoArrowCue}
    />
  );
}
