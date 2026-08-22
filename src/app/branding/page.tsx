import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { brandingCases, brandingIntroLines } from "@/lib/content";

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
        menu
      />
    </>
  );
}
