import type { Metadata } from "next";
import { BodyCopy } from "@/components/BodyCopy";
import { EmailShineLink } from "@/components/EmailShineLink";
import { ParallaxBlock } from "@/components/ParallaxBlock";
import { contact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ashton Hanson Design.",
};

export default function ContactPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-8.5rem)] items-center justify-center overflow-hidden px-5 py-16 md:px-8 xl:px-12 2xl:px-16">
      <ParallaxBlock
        title={contact.title}
        subtitle={contact.subtitle}
        subtitleTravel={false}
        as="h1"
        className="w-full"
      >
        <BodyCopy className="mx-auto max-w-xl whitespace-pre-line font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.75] tracking-[0.01em] text-foreground xl:max-w-2xl xl:text-[clamp(1.2rem,1.35vw,1.4rem)]">
          {contact.body}
        </BodyCopy>
        <EmailShineLink email={contact.email} />
      </ParallaxBlock>
    </section>
  );
}
