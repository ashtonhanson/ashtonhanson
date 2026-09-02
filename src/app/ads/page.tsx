import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { adCases, adCategories, adsIntro } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising and campaign design by Ashton Hanson Design.",
};

export default function AdsPage() {
  return (
    <>
      <BrandingScene
        introTitle="ADS"
        introLines={[adsIntro]}
        introTags={adCategories}
        cases={adCases}
        menu
        adsMotion
        introBodyLowerExit
      />
    </>
  );
}
