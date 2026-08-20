import type { Metadata } from "next";
import { BrandingScene } from "@/components/BrandingScene";
import {
  CONTACT_HANDOFF,
  CONTACT_INTRO,
} from "@/lib/brandingMotion";
import { contact, contactCases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ashton Hanson Design.",
};

export default function ContactPage() {
  return (
    <BrandingScene
      introTitle={contact.title}
      introLines={[]}
      intro={CONTACT_INTRO}
      handoff={CONTACT_HANDOFF}
      cases={contactCases}
    />
  );
}
