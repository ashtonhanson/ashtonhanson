import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { adCases, adCategories, adsIntroLines } from "@/lib/content";

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
        menu
        introBodyLowerExit
      />
    </>
  );
}
