"use client";

import { useEffect, useRef } from "react";
import { ContactForm } from "@/components/ContactForm";
import { EmailShineLink } from "@/components/EmailShineLink";
import { LogoPlate } from "@/components/LogoPlate";
import { MediaCarousel } from "@/components/MediaCarousel";
import { MobileBreakText } from "@/components/MobileBreakText";
import { TitleShine } from "@/components/TitleShine";
import {
  arriveAngle,
  arriveT,
  arriveTransform,
  BRANDING_INTRO,
  clamp,
  easeInOutCubic,
  easeOutCubic,
  finaleExitPose,
  finaleExitT,
  finaleWindows,
  HUB_HANDOFF,
  hubHandoffT,
  PAGE_FINALE,
  shrinkOutPose,
  type ArriveKind,
  type HandoffTiming,
  type IntroTiming,
} from "@/lib/brandingMotion";
import {
  createIdleHoverState,
  composeIdleTransform,
  type IdleHoverState,
} from "@/lib/idleHover";
import {
  createMousePullState,
  stepMousePull,
  type MousePullKind,
  type MousePullState,
} from "@/lib/mousePull";
import {
  createLoadClearState,
  LOAD_CLEAR_BLUR_PX,
  applyPinStage,
  pageHasScrolled,
  stepLoadClear,
  viewHeight,
} from "@/lib/loadClear";
import type { CaseStudy as CaseStudyType, MediaItem } from "@/lib/content";
import { preventOrphan } from "@/lib/text";

const TITLE_CLASS =
  "pointer-events-none select-none whitespace-pre-line text-center font-display text-[clamp(2.6rem,10.5vw,6rem)] font-black uppercase leading-[0.88] tracking-[0.04em] xl:text-[clamp(3.4rem,6.2vw,7.75rem)]";

const SECTION_TITLE_CLASS =
  "pointer-events-none select-none whitespace-pre-line text-center font-display text-[clamp(1.35rem,4.2vw,2.35rem)] font-black uppercase leading-[0.92] tracking-[0.06em] xl:text-[clamp(1.7rem,2.6vw,2.75rem)]";

const SUBTITLE_CLASS =
  "font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-[1.85] tracking-[0.18em] text-foreground md:leading-tight xl:text-[clamp(1.35rem,1.55vw,1.7rem)]";

const BODY_CLASS =
  "w-full text-center font-display text-[clamp(1.125rem,2.15vw,1.275rem)] font-normal leading-[1.7] tracking-[0.01em] text-foreground [text-wrap:pretty] xl:text-[clamp(1.2rem,1.35vw,1.4rem)]";

/** Stronger idle float for branding titles / subtitles only. */
const LOCKUP_IDLE = 1.75;
const SUBTITLE_IDLE = 1.55;

type BrandingSceneProps = {
  introTitle: string;
  introLines: readonly string[];
  /** Optional uppercase labels under the intro copy (e.g. ad categories). */
  introTags?: readonly string[];
  /** Optional subtitle under the intro title (e.g. contact). */
  introSubtitle?: string;
  /** Last study scales toward camera and vanishes, like ABOUT. */
  finale?: boolean;
  /** Single-image plates instead of a carousel (logos). */
  mediaVariant?: "carousel" | "plate";
  introEmail?: string;
  /** Override intro pin timing (contact uses a shorter lockup). */
  intro?: Partial<IntroTiming>;
  /** Override first-study handoff timing. */
  handoff?: Partial<HandoffTiming>;
  cases: CaseStudyType[];
};

function paint(
  el: HTMLElement | null,
  opacity: number,
  blur: number,
  transform: string,
) {
  if (!el) return;
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  el.style.transformStyle = "preserve-3d";
  el.style.transform = transform;
  el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
}

export function BrandingScene({
  introTitle,
  introLines,
  introTags = [],
  introSubtitle,
  finale = false,
  mediaVariant = "carousel",
  introEmail,
  intro: introOverride,
  handoff: handoffOverride,
  cases,
}: BrandingSceneProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagsRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const intro = { ...BRANDING_INTRO, ...introOverride };
  const handoff = { ...HUB_HANDOFF, ...handoffOverride };

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();
    const introBodyCount = introLines.length ? 1 : 0;
    const lineCount =
      introBodyCount +
      (introSubtitle ? 1 : 0) +
      (introTags.length ? 1 : 0) +
      (introEmail ? 1 : 0);
    const scaleUpExit = finale && cases.length === 0;
    const { linesStart, lineSpan, holdAfter, exitSpan } = intro;
    const idleMap = new WeakMap<HTMLElement, IdleHoverState>();
    const pullMap = new WeakMap<HTMLElement, MousePullState>();
    const loadClear = createLoadClearState();

    const idleFor = (el: HTMLElement) => {
      let state = idleMap.get(el);
      if (!state) {
        state = createIdleHoverState();
        idleMap.set(el, state);
      }
      return state;
    };

    const pullFor = (el: HTMLElement) => {
      let state = pullMap.get(el);
      if (!state) {
        state = createMousePullState();
        pullMap.set(el, state);
      }
      return state;
    };

    const paintIdle = (
      el: HTMLElement | null,
      opacity: number,
      blur: number,
      transform: string,
      seed: number,
      now: number,
      dt: number,
      atRest: boolean,
      travelT = 0,
      idleAmount = 1,
      pullKind: MousePullKind | null = "title",
    ) => {
      if (!el) return;
      const pull =
        pullKind && opacity > 0.04
          ? stepMousePull(
              pullFor(el),
              el,
              now,
              dt,
              pullKind,
              1 - Math.min(1, Math.max(0, travelT)),
            )
          : undefined;
      paint(
        el,
        opacity,
        blur,
        composeIdleTransform(
          idleFor(el),
          transform,
          now,
          dt,
          seed,
          atRest,
          travelT,
          idleAmount,
          pull,
        ),
      );
    };

    const introMetrics = () => {
      const lastInEnd = linesStart + lineCount * lineSpan;
      const exitGate = lastInEnd + holdAfter;
      return { exitGate, pack: 1, packedExitGate: exitGate };
    };

    const updateIntro = (
      progress: number,
      pack: number,
      exitGate: number,
      now: number,
      dt: number,
    ) => {
      if (scaleUpExit && stageRef.current) {
        stageRef.current.style.perspective = "1400px";
        stageRef.current.style.perspectiveOrigin = "50% 42%";
        const stageFade = easeInOutCubic(
          clamp(
            (progress - PAGE_FINALE.stageFadeStart) /
              Math.max(PAGE_FINALE.stageFadeEnd - PAGE_FINALE.stageFadeStart, 0.0001),
            0,
            1,
          ),
        );
        stageRef.current.style.opacity = (1 - stageFade).toFixed(3);
      }

      const paintExitOrRest = (
        el: HTMLElement | null,
        segmentIndex: number,
        atRest: () => void,
        idleAmount = 1,
        pullKind: MousePullKind | null = "title",
      ) => {
        if (!el) return;
        const outStart = (exitGate + segmentIndex * exitSpan) * pack;
        const outEnd = (exitGate + segmentIndex * exitSpan + exitSpan) * pack;
        if (progress >= outStart) {
          const exitT = (progress - outStart) / Math.max(outEnd - outStart, 0.0001);
          const pose = scaleUpExit
            ? finaleExitPose(
                exitT,
                arriveAngle(segmentIndex),
                pullKind === "title" ? "title" : "copy",
              )
            : shrinkOutPose(exitT, arriveAngle(segmentIndex));
          el.style.transformOrigin = pose.origin;
          paintIdle(
            el,
            pose.opacity,
            pose.blur,
            pose.transform,
            segmentIndex,
            now,
            dt,
            false,
            pose.travelT,
            idleAmount,
            pullKind,
          );
          return;
        }
        atRest();
      };

      paintExitOrRest(
        titleRef.current,
        0,
        () => {
          const el = titleRef.current;
          if (!el) return;
          el.style.transformOrigin = "50% 50%";
          const loadBlend = stepLoadClear(
            loadClear,
            dt,
            pageHasScrolled() || progress > 0.002,
          );
          paintIdle(
            el,
            1,
            loadBlend * LOAD_CLEAR_BLUR_PX,
            "none",
            0,
            now,
            dt,
            loadBlend < 0.08,
            0,
            LOCKUP_IDLE,
            "title",
          );
        },
        LOCKUP_IDLE,
        "title",
      );

      const subOffset = introSubtitle ? 1 : 0;
      if (introSubtitle) {
        paintExitOrRest(
          subtitleRef.current,
          1,
          () => {
            const el = subtitleRef.current;
            if (!el) return;
            el.style.transformOrigin = "50% 50%";
            const inStart = linesStart * pack;
            const inEnd = (linesStart + lineSpan * 0.72) * pack;
            const t = easeOutCubic(
              clamp((progress - inStart) / Math.max(inEnd - inStart, 0.0001), 0, 1),
            );
            const angle = arriveAngle(1);
            const u = 1 - t;
            const scale = 1 + 1.5 * u;
            const transform = `translate3d(${(angle.x * u).toFixed(2)}vw, ${(angle.y * u).toFixed(2)}vh, 0) rotateZ(${(angle.rot * u).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
            paintIdle(
              el,
              t,
              12 * u,
              transform,
              1,
              now,
              dt,
              t >= 0.985,
              1 - t,
              SUBTITLE_IDLE,
              "subtitle",
            );
          },
          SUBTITLE_IDLE,
          "subtitle",
        );
      }

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        paintExitOrRest(
          el,
          i + 1 + subOffset,
          () => {
            el.style.transformOrigin = "50% 50%";
            const inStart = (linesStart + (i + subOffset) * lineSpan) * pack;
            const inEnd =
              (linesStart + (i + subOffset) * lineSpan + lineSpan * 0.72) *
              pack;
            const t = easeOutCubic(
              clamp((progress - inStart) / Math.max(inEnd - inStart, 0.0001), 0, 1),
            );
            const angle = arriveAngle(i + 1 + subOffset);
            const u = 1 - t;
            const scale = 1 + 1.8 * u;
            const transform = `translate3d(${(angle.x * u).toFixed(2)}vw, ${(angle.y * u).toFixed(2)}vh, 0) rotateZ(${(angle.rot * u).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
            paintIdle(
              el,
              t,
              14 * u,
              transform,
              i + 1 + subOffset,
              now,
              dt,
              t >= 0.985,
              1 - t,
              1,
              "body",
            );
          },
          1,
          "body",
        );
      });

      if (introTags.length) {
        const tagIndex = introBodyCount + 1 + subOffset;
        paintExitOrRest(
          tagsRef.current,
          tagIndex,
          () => {
            const el = tagsRef.current;
            if (!el) return;
            el.style.transformOrigin = "50% 50%";
            const inStart =
              (linesStart + (introBodyCount + subOffset) * lineSpan) * pack;
            const inEnd =
              (linesStart +
                (introBodyCount + subOffset) * lineSpan +
                lineSpan * 0.72) *
              pack;
            const t = easeOutCubic(
              clamp((progress - inStart) / Math.max(inEnd - inStart, 0.0001), 0, 1),
            );
            const angle = arriveAngle(tagIndex);
            const u = 1 - t;
            const scale = 1 + 1.35 * u;
            const transform = `translate3d(${(angle.x * u).toFixed(2)}vw, ${(angle.y * u).toFixed(2)}vh, 0) rotateZ(${(angle.rot * u).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
            paintIdle(
              el,
              t,
              12 * u,
              transform,
              tagIndex,
              now,
              dt,
              t >= 0.985,
              1 - t,
              SUBTITLE_IDLE,
              "subtitle",
            );
          },
          SUBTITLE_IDLE,
          "subtitle",
        );
      }

      if (introEmail) {
        const emailIndex =
          introBodyCount + subOffset + (introTags.length ? 1 : 0) + 1;
        paintExitOrRest(
          emailRef.current,
          emailIndex,
          () => {
            const el = emailRef.current;
            if (!el) return;
            el.style.transformOrigin = "50% 50%";
            const inStart =
              (linesStart +
                (introBodyCount + subOffset + (introTags.length ? 1 : 0)) *
                  lineSpan) *
              pack;
            const inEnd =
              (linesStart +
                (introBodyCount + subOffset + (introTags.length ? 1 : 0)) *
                  lineSpan +
                lineSpan * 0.72) *
              pack;
            const t = easeOutCubic(
              clamp((progress - inStart) / Math.max(inEnd - inStart, 0.0001), 0, 1),
            );
            const angle = arriveAngle(emailIndex);
            const u = 1 - t;
            const scale = 1 + 1.2 * u;
            const transform = `translate3d(${(angle.x * u).toFixed(2)}vw, ${(angle.y * u).toFixed(2)}vh, 0) rotateZ(${(angle.rot * u).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
            paintIdle(
              el,
              t,
              10 * u,
              transform,
              emailIndex,
              now,
              dt,
              t >= 0.985,
              1 - t,
              SUBTITLE_IDLE,
              "subtitle",
            );
          },
          SUBTITLE_IDLE,
          "subtitle",
        );
      }
    };

    const updateArrivals = (
      introProgress: number,
      packedExitGate: number,
      now: number,
      dt: number,
    ) => {
      const root = sceneRef.current;
      if (!root) return;
      const viewH = viewHeight();
      const nodes = root.querySelectorAll<HTMLElement>("[data-arrive]");
      const finalePin = root.querySelector<HTMLElement>("[data-finale]");
      const finaleStage = root.querySelector<HTMLElement>("[data-finale-stage]");
      let finaleProgress = 0;
      if (finalePin) {
        const range = finalePin.offsetHeight - viewH;
        const pinRect = finalePin.getBoundingClientRect();
        finaleProgress =
          range < 64 ? 0 : clamp(-pinRect.top / Math.max(range, 1), 0, 1);
        if (finaleStage) {
          const { stageFadeStart, stageFadeEnd } = PAGE_FINALE;
          const stageFade = easeInOutCubic(
            clamp(
              (finaleProgress - stageFadeStart) /
                Math.max(stageFadeEnd - stageFadeStart, 0.0001),
              0,
              1,
            ),
          );
          finaleStage.style.opacity = (1 - stageFade).toFixed(3);
        }
      }
      const finaleNodes = finalePin
        ? [...finalePin.querySelectorAll<HTMLElement>("[data-arrive]")]
        : [];
      const finaleOuts = finaleWindows(finaleNodes.length);
      nodes.forEach((el) => {
        const kind = (el.dataset.kind || "copy") as ArriveKind;
        const lag = Number(el.dataset.lag || 0);
        const index = Number(el.dataset.angle || 0);
        // Measure the unposed wrapper so hover / arrive transforms
        // cannot feed back into t (that used to force a one-way latch).
        const rect = el.getBoundingClientRect();
        let t = arriveT(rect.top, viewH, kind, lag);
        if (el.hasAttribute("data-hub-handoff")) {
          const lockup = el.closest("[data-first-study]");
          const siblings = lockup
            ? [...lockup.querySelectorAll<HTMLElement>("[data-hub-handoff]")]
            : [];
          const order = Math.max(0, siblings.indexOf(el));
          t = hubHandoffT(
            introProgress,
            packedExitGate,
            order,
            siblings.length,
            handoff,
          );
        }
        const poseEl = (el.firstElementChild as HTMLElement) ?? el;
        el.style.transform = "none";
        el.style.filter = "none";
        el.style.opacity = "1";
        el.style.visibility = "visible";
        const still = el.hasAttribute("data-still");
        const idleAmount = still
          ? 0
          : kind === "title"
            ? LOCKUP_IDLE
            : el.dataset.idle === "subtitle"
              ? SUBTITLE_IDLE
              : 1;
        const pullKind: MousePullKind | null = still
          ? null
          : kind === "media"
            ? "gallery"
            : kind === "title"
              ? "title"
              : el.dataset.idle === "subtitle"
                ? "subtitle"
                : "body";
        const finaleIndex = finaleNodes.indexOf(el);
        const finaleWin = finaleIndex >= 0 ? finaleOuts[finaleIndex] : undefined;
        if (finaleWin && finaleProgress >= finaleWin.start) {
          const out = finaleExitPose(
            finaleExitT(finaleProgress, finaleWin),
            arriveAngle(index),
            kind,
          );
          poseEl.style.transformOrigin = out.origin;
          paintIdle(
            poseEl,
            out.opacity,
            out.blur,
            out.transform,
            index + 11,
            now,
            dt,
            false,
            out.travelT,
            idleAmount,
            pullKind,
          );
          return;
        }
        const pose = arriveTransform(t, arriveAngle(index), kind);
        poseEl.style.transformOrigin = pose.origin;
        paintIdle(
          poseEl,
          pose.opacity,
          pose.blur,
          pose.transform,
          index + 11,
          now,
          dt,
          t >= 0.985,
          1 - t,
          idleAmount,
          pullKind,
        );
      });
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const pin = pinRef.current;
      if (!pin) return;
      applyPinStage(pin, stageRef.current);
      const viewH = viewHeight();
      const range = pin.offsetHeight - viewH;
      const rect = pin.getBoundingClientRect();
      const progress =
        range < 64 ? 0 : clamp(-rect.top / Math.max(range, 1), 0, 1);
      const { pack, packedExitGate, exitGate } = introMetrics();
      updateIntro(progress, pack, exitGate, now, dt);
      updateArrivals(progress, packedExitGate, now, dt);
    };

    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [introLines.length, introTags.length, introSubtitle, introEmail, finale, cases.length, intro.pinHeightVh, intro.linesStart, intro.lineSpan, intro.holdAfter, intro.exitSpan, handoff.lead, handoff.span, handoff.finish]);

  let angleCursor =
    (introLines.length ? 1 : 0) +
    (introSubtitle ? 1 : 0) +
    (introTags.length ? 1 : 0) +
    (introEmail ? 1 : 0);

  return (
    <div ref={sceneRef}>
      <section
        ref={pinRef}
        className="relative"
        style={{ height: intro.pinHeightVh }}
        aria-label={`${introTitle} introduction`}
      >
        <div
          ref={stageRef}
          className="absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] flex-col items-center justify-center overflow-clip px-5 md:px-8 xl:px-12"
        >
          <div
            ref={titleRef}
            className="will-change-transform"
            style={{
              transformOrigin: "50% 50%",
              filter: `blur(${LOAD_CLEAR_BLUR_PX}px)`,
            }}
          >
            <TitleShine as="h1" className={TITLE_CLASS}>
              {introTitle}
            </TitleShine>
          </div>

          {introSubtitle ? (
            <div
              ref={subtitleRef}
              className="mt-8 will-change-transform xl:mt-10"
              style={{
                opacity: 0,
                visibility: "hidden",
                transformOrigin: "50% 50%",
              }}
            >
              <p className={SUBTITLE_CLASS}>
                <MobileBreakText text={introSubtitle} />
              </p>
            </div>
          ) : null}

          <div className="relative mx-auto mt-8 w-full max-w-3xl text-center xl:mt-10 xl:max-w-4xl">
            {introLines.length ? (
              <div
                ref={(el) => {
                  lineRefs.current[0] = el;
                }}
                className="will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                }}
              >
                <p className={`${BODY_CLASS} mx-auto mb-0`}>
                  {preventOrphan(introLines.join(" "))}
                </p>
              </div>
            ) : null}
            {introTags.length ? (
              <div
                ref={tagsRef}
                className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-4 will-change-transform xl:mt-12 xl:gap-x-14"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                }}
              >
                {introTags.map((tag) => (
                  <p
                    key={tag}
                    className="font-display text-[0.78rem] font-semibold tracking-[0.22em] text-ink"
                  >
                    {tag}
                  </p>
                ))}
              </div>
            ) : null}
            {introEmail ? (
              <div
                ref={emailRef}
                className="will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                }}
              >
                <EmailShineLink email={introEmail} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {cases.length ? (
      <div
        className="relative z-[12] divide-y divide-line"
        style={{ marginTop: intro.overlapCases }}
      >
        {cases.map((study, studyIndex) => {
          const bodyText = study.body.trim();
          const subText = study.subtitle.trim();
          const titleAngle = angleCursor++;
          const subAngle = subText ? angleCursor++ : -1;
          const bodyAngle = bodyText ? angleCursor++ : -1;
          const formAngle = study.form ? angleCursor++ : -1;
          const mediaAngle = study.media?.length ? angleCursor++ : -1;
          const sections = study.sections ?? [];
          const isFinale = finale && studyIndex === cases.length - 1;

          return (
            <article
              key={study.id}
              id={study.id}
              data-first-study={studyIndex === 0 ? "" : undefined}
              data-finale={isFinale ? "" : undefined}
              className={
                isFinale
                  ? "relative overflow-visible"
                  : "relative overflow-visible px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8 xl:px-12 xl:py-[clamp(5.5rem,13vh,11rem)] 2xl:px-16"
              }
              style={isFinale ? { height: PAGE_FINALE.pinHeightVh } : undefined}
            >
              <div
                data-finale-stage={isFinale ? "" : undefined}
                className={
                  isFinale
                    ? "sticky top-[3.6rem] mx-auto flex min-h-[calc(100dvh-3.6rem)] w-full max-w-3xl flex-col items-center justify-center overflow-visible px-5 text-center md:px-8 xl:max-w-4xl xl:px-12 2xl:max-w-5xl 2xl:px-16"
                    : "mx-auto flex max-w-3xl flex-col items-center text-center xl:max-w-4xl 2xl:max-w-5xl"
                }
                style={
                  isFinale
                    ? { perspective: "1400px", perspectiveOrigin: "50% 42%" }
                    : undefined
                }
              >
                <div
                  data-arrive
                  data-hub-handoff={studyIndex === 0 ? "" : undefined}
                  data-kind="title"
                  data-angle={titleAngle}
                  className="will-change-transform"
                  style={{
                    opacity: 0,
                    transformOrigin: "50% 50%",
                  }}
                >
                  <TitleShine as="h2" className={TITLE_CLASS}>
                    {study.title}
                  </TitleShine>
                </div>

                {subText ? (
                <div
                  data-arrive
                  data-hub-handoff={studyIndex === 0 ? "" : undefined}
                  data-kind="copy"
                  data-idle="subtitle"
                  data-angle={subAngle}
                  data-lag="12"
                  className="mt-4 will-change-transform xl:mt-5"
                  style={{
                    opacity: 0,
                    transformOrigin: "50% 50%",
                  }}
                >
                  <p className={SUBTITLE_CLASS}>
                    <MobileBreakText text={study.subtitle} />
                  </p>
                </div>
                ) : null}

                {bodyText ? (
                  <div className="mt-8 w-full max-w-3xl text-center xl:mt-10 xl:max-w-4xl">
                    <div
                      data-arrive
                      data-hub-handoff={studyIndex === 0 ? "" : undefined}
                      data-kind="copy"
                      data-angle={bodyAngle}
                      data-lag={20}
                      className="will-change-transform"
                      style={{
                        opacity: 0,
                        transformOrigin: "50% 50%",
                      }}
                    >
                      <p className={`${BODY_CLASS} mx-auto mb-0`}>
                        {preventOrphan(bodyText)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {study.form ? (
                  <div
                    data-arrive
                    data-hub-handoff={studyIndex === 0 ? "" : undefined}
                    data-still=""
                    data-kind="copy"
                    data-angle={formAngle}
                    data-lag={36}
                    className="mt-12 w-full max-w-lg will-change-transform xl:mt-14"
                    style={{ opacity: 0, transformOrigin: "50% 40%" }}
                  >
                    <ContactForm />
                  </div>
                ) : study.media?.length ? (
                  <ArriveMedia
                    items={study.media}
                    label={`${study.title} gallery`}
                    angle={mediaAngle}
                    hubHandoff={studyIndex === 0}
                    variant={mediaVariant}
                  />
                ) : null}

                {sections.map((section) => {
                  const headingAngle = angleCursor++;
                  const galleryAngle = section.media?.length
                    ? angleCursor++
                    : -1;
                  return (
                    <div
                      key={section.heading}
                      className="mt-16 w-full xl:mt-20"
                    >
                      <div
                        data-arrive
                        data-kind="title"
                        data-angle={headingAngle}
                        className="will-change-transform"
                        style={{
                          opacity: 0,
                          transformOrigin: "50% 50%",
                        }}
                      >
                        <TitleShine as="h3" className={SECTION_TITLE_CLASS}>
                          {section.heading}
                        </TitleShine>
                      </div>
                      {section.media?.length ? (
                        <ArriveMedia
                          items={section.media}
                          label={`${section.heading} gallery`}
                          angle={galleryAngle}
                          lag={28}
                          variant={mediaVariant}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      ) : null}
    </div>
  );
}

function ArriveMedia({
  items,
  label,
  angle,
  lag = 36,
  hubHandoff = false,
  variant = "carousel",
}: {
  items: MediaItem[];
  label: string;
  angle: number;
  lag?: number;
  hubHandoff?: boolean;
  variant?: "carousel" | "plate";
}) {
  const plate = variant === "plate" ? items[0] : null;
  return (
    <div
      data-arrive
      data-hub-handoff={hubHandoff ? "" : undefined}
      data-kind="media"
      data-angle={angle}
      data-lag={lag}
      className="mt-12 w-full max-w-5xl will-change-transform xl:mt-14 xl:max-w-6xl 2xl:max-w-7xl"
      style={{ opacity: 0, transformOrigin: "50% 40%" }}
    >
      {plate ? (
        <LogoPlate src={plate.src} alt={plate.alt} />
      ) : (
        <MediaCarousel items={items} label={label} />
      )}
    </div>
  );
}
