import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { logosIntro } from "@/lib/content";
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
        introLines={[logosIntro]}
        cases={logosWithBrandingGalleries()}
        mediaVariant="plate"
        menu
        introBodyLowerExit
      />
    </>
  );
}
