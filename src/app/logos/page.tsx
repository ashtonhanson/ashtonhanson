import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import { logoCases, logosIntroLines } from "@/lib/content";

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
        menu
      />
    </>
  );
}
