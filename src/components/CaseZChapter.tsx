"use client";

import { Fragment, type ReactNode } from "react";
import { ContactForm } from "@/components/ContactForm";
import { LogoPlate } from "@/components/LogoPlate";
import { MediaCarousel } from "@/components/MediaCarousel";
import { MobileBreakText } from "@/components/MobileBreakText";
import { TitleShine } from "@/components/TitleShine";
import { ZHandoffChapter } from "@/components/ZHandoffChapter";
import { splitSentences } from "@/lib/brandingMotion";
import type { CaseStudy as CaseStudyType, MediaItem } from "@/lib/content";
import { preventOrphan } from "@/lib/text";

const TITLE_CLASS =
  "pointer-events-none select-none max-w-full whitespace-pre-line text-center font-display text-[clamp(1.65rem,10.5vw,6rem)] font-black uppercase leading-[0.88] tracking-[0.04em] xl:text-[clamp(3.4rem,6.2vw,7.75rem)]";

const FORM_TITLE_CLASS =
  "pointer-events-none select-none max-w-full whitespace-pre-line text-center font-display text-[clamp(1.45rem,8.2vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[0.04em] xl:text-[clamp(2.4rem,4.2vw,4.25rem)]";

const SECTION_TITLE_CLASS =
  "pointer-events-none select-none whitespace-pre-line text-center font-display text-[clamp(1.35rem,4.2vw,2.35rem)] font-black uppercase leading-[0.92] tracking-[0.06em] xl:text-[clamp(1.7rem,2.6vw,2.75rem)]";

const SUBTITLE_CLASS =
  "font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-[1.85] tracking-[0.18em] text-foreground md:leading-tight xl:text-[clamp(1.35rem,1.55vw,1.7rem)]";

const BODY_CLASS =
  "w-full max-w-xl text-center font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.7] tracking-[0.01em] text-foreground [text-wrap:pretty] xl:text-[clamp(1.2rem,1.35vw,1.4rem)]";

const hidden: { opacity: number; visibility: "hidden"; transformOrigin: string } = {
  opacity: 0,
  visibility: "hidden",
  transformOrigin: "50% 50%",
};

export function caseZItemCount(study: CaseStudyType) {
  let n = 1;
  if (study.subtitle.trim()) n += 1;
  n += splitSentences(study.body).length;
  if (study.form) n += 1;
  if (study.media?.length) n += 1;
  for (const section of study.sections ?? []) {
    n += 1;
    if (section.media?.length) n += 1;
  }
  return n;
}

function ZItem({
  index,
  kind,
  className,
  origin,
  children,
}: {
  index: number;
  kind: "title" | "copy" | "media";
  className?: string;
  origin?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-z-item
      data-kind={kind}
      data-index={index}
      className={`will-change-transform ${className ?? ""}`.trim()}
      style={{
        ...hidden,
        transformOrigin: origin ?? hidden.transformOrigin,
      }}
    >
      {children}
    </div>
  );
}

function MediaItemStage({
  items,
  label,
  variant,
}: {
  items: MediaItem[];
  label: string;
  variant: "carousel" | "plate";
}) {
  const plate = variant === "plate" ? items[0] : null;
  if (plate) return <LogoPlate src={plate.src} alt={plate.alt} />;
  return <MediaCarousel items={items} label={label} />;
}

export function CaseZChapter({
  study,
  overlap,
  mediaVariant = "carousel",
  poseOffset = 0,
  zIndex = 12,
}: {
  study: CaseStudyType;
  overlap?: string;
  mediaVariant?: "carousel" | "plate";
  poseOffset?: number;
  zIndex?: number;
}) {
  const sentences = splitSentences(study.body);
  const subText = study.subtitle.trim();
  const hasMedia = Boolean(study.media?.length);
  const itemCount = caseZItemCount(study);
  let index = 0;

  const titleIndex = index++;
  const subIndex = subText ? index++ : -1;
  const sentenceIndexes = sentences.map(() => index++);
  const formIndex = study.form ? index++ : -1;
  const mediaIndex = hasMedia ? index++ : -1;
  const sectionSlots = (study.sections ?? []).map((section) => ({
    heading: index++,
    gallery: section.media?.length ? index++ : -1,
  }));

  return (
    <ZHandoffChapter
      id={study.id}
      itemCount={itemCount}
      overlap={overlap}
      poseOffset={poseOffset}
      zIndex={zIndex}
      stageClassName="!overflow-visible"
      aria-label={study.title.replace(/\n/g, " ")}
    >
      <ZItem index={titleIndex} kind="title">
        <TitleShine as="h2" className={study.form ? FORM_TITLE_CLASS : TITLE_CLASS}>
          {study.title}
        </TitleShine>
      </ZItem>

      {subText ? (
        <ZItem index={subIndex} kind="copy">
          <p className={SUBTITLE_CLASS}>
            <MobileBreakText text={study.subtitle} />
          </p>
        </ZItem>
      ) : null}

      {sentences.map((sentence, i) => (
        <ZItem key={sentence} index={sentenceIndexes[i]!} kind="copy">
          <p className={`${BODY_CLASS} mx-auto mb-0`}>
            {preventOrphan(sentence)}
          </p>
        </ZItem>
      ))}

      {study.form ? (
        <ZItem index={formIndex} kind="copy" className="w-full max-w-lg px-3">
          <ContactForm />
        </ZItem>
      ) : null}

      {hasMedia && study.media ? (
        <ZItem
          index={mediaIndex}
          kind="media"
          className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
          origin="50% 40%"
        >
          <MediaItemStage
            items={study.media}
            label={`${study.title} gallery`}
            variant={mediaVariant}
          />
        </ZItem>
      ) : null}

      {(study.sections ?? []).map((section, i) => {
        const slot = sectionSlots[i]!;
        return (
          <Fragment key={section.heading}>
            <ZItem index={slot.heading} kind="title">
              <TitleShine as="h3" className={SECTION_TITLE_CLASS}>
                {section.heading}
              </TitleShine>
            </ZItem>
            {section.media?.length ? (
              <ZItem
                index={slot.gallery}
                kind="media"
                className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
                origin="50% 40%"
              >
                <MediaItemStage
                  items={section.media}
                  label={`${section.heading} gallery`}
                  variant={mediaVariant}
                />
              </ZItem>
            ) : null}
          </Fragment>
        );
      })}
    </ZHandoffChapter>
  );
}
