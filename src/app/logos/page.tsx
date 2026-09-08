import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { logosIntroLines } from "@/lib/content";
import { logosWithBrandingGalleries } from "@/lib/logosWithBranding";

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
        cases={logosWithBrandingGalleries()}
        mediaVariant="plate"
        menu
        introBodyLowerExit
      />
    </>
  );
}
