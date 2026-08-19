import { BodyCopy } from "@/components/BodyCopy";
import { ParallaxBlock } from "@/components/ParallaxBlock";

type PageIntroProps = {
  title: string;
  body?: string;
};

export function PageIntro({ title, body }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden px-5 pb-12 pt-[clamp(4.5rem,12vh,7rem)] md:px-8 md:pb-16 xl:px-12 xl:pb-20 xl:pt-[clamp(5.5rem,13vh,9rem)] 2xl:px-16">
      <ParallaxBlock title={title} as="h1">
        {body ? (
          <BodyCopy className="mx-auto max-w-2xl font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.75] tracking-[0.01em] text-foreground xl:max-w-3xl xl:text-[clamp(1.2rem,1.35vw,1.4rem)]">
            {body}
          </BodyCopy>
        ) : (
          <div className="h-[clamp(1rem,3vh,2rem)] xl:h-[clamp(1.5rem,3.5vh,2.75rem)]" />
        )}
      </ParallaxBlock>
    </section>
  );
}
