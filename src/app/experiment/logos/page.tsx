"use client";

import { BrandingScene } from "@/components/BrandingScene";
import { logosIntro } from "@/lib/content";
import { logosWithBrandingGalleries } from "../logosWithBranding";
import { LogoArrowCue } from "../LogoArrowCue";

export default function ExperimentLogosPage() {
  return (
    <BrandingScene
      introTitle="LOGOS"
      introLines={[logosIntro]}
      cases={logosWithBrandingGalleries()}
      mediaVariant="plate"
      menu
      introBodyLowerExit
      Cue={LogoArrowCue}
    />
  );
}
