import { BodyCopy } from "@/components/BodyCopy";
import { ParallaxBlock } from "@/components/ParallaxBlock";

type PageIntroProps = {
  title: string;
  body?: string;
};

export function PageIntro({ title, body }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden px-5 pb-12 pt-[clamp(4.5rem,12vh,7rem)] md:px-8 md:pb-16">
      <ParallaxBlock title={title} as="h1">
        {body ? (
          <BodyCopy className="mx-auto max-w-2xl font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.75] tracking-[0.01em] text-foreground">
            {body}
          </BodyCopy>
        ) : (
          <div className="h-[clamp(1rem,3vh,2rem)]" />
        )}
      </ParallaxBlock>
    </section>
  );
}
