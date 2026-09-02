"use client";

import { BrandingScene } from "@/components/BrandingScene";
import { CONTACT_INTRO } from "@/lib/brandingMotion";
import { contact } from "@/lib/content";
import { LogoArrowCue } from "../LogoArrowCue";

export default function ExperimentContactPage() {
  return (
    <BrandingScene
      introTitle={contact.title}
      introLines={[]}
      introForm
      intro={CONTACT_INTRO}
      cases={[]}
      Cue={LogoArrowCue}
    />
  );
}
