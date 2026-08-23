"use client";

import { useEffect, useRef } from "react";
import { ContactForm } from "@/components/ContactForm";
import { EmailShineLink } from "@/components/EmailShineLink";
import { LogoPlate } from "@/components/LogoPlate";
import { MediaCarousel } from "@/components/MediaCarousel";
import { MobileBreakText } from "@/components/MobileBreakText";
import { ScrollCue } from "@/components/ScrollCue";
import { TitleShine } from "@/components/TitleShine";
import {
  arriveAngle,
  oppositeArriveAngle,
  arriveGrowTransform,
  arriveT,
  arriveTransform,
  BRANDING_INTRO,
  BRANDING_LEAN,
  clamp,
  easeInOutCubic,
  finaleExitPose,
  finaleExitT,
  finaleWindows,
  HUB_HANDOFF,
  hubHandoffT,
  PAGE_FINALE,
  sampleBrandingIntroPose,
  sampleIntroBodyPose,
  TEXT_DIRECTIONAL_LEAN,
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
  pinProgress,
  stepLoadClear,
  viewHeight,
  visualRectTop,
} from "@/lib/loadClear";
import {
  ABOUT_INTRO,
  cueHoldOpacity,
  cueLifeT,
  cueArriveY,
  handoffVisibility,
  introHandoffs,
  poseToTransform,
  sampleIntroPose,
} from "@/lib/cinematicDepth";
import { SeeMenuArrive } from "@/components/SeeMenuBlock";
import { contact, type CaseStudy as CaseStudyType, type MediaItem } from "@/lib/content";
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
  /** Render the contact form inside the intro pin (CONTACT → form). */
  introForm?: boolean;
  /** Override intro pin timing (contact uses a shorter lockup). */
  intro?: Partial<IntroTiming>;
  /** Override first-study handoff timing. */
  handoff?: Partial<HandoffTiming>;
  cases: CaseStudyType[];
  /** Last lockup — SEE MENU / FOR OTHER / WORK. Uses the same arrive as cases. */
  menu?: boolean;
  /** Branding page — right-biased intro + stronger directional lean on text. */
  brandingMotion?: boolean;
  /** ADS / LOGOS — intro paragraph exits a little lower. */
  introBodyLowerExit?: boolean;
};

function paint(
  el: HTMLElement | null,
  opacity: number,
  blur: number,
  transform: string,
  hideWhenGone = true,
) {
  if (!el) return;
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  el.style.transformStyle = "preserve-3d";
  el.style.transform = transform;
  el.style.visibility =
    hideWhenGone && opacity < 0.02 ? "hidden" : "visible";
}

export function BrandingScene({
  introTitle,
  introLines,
  introTags = [],
  introSubtitle,
  finale = false,
  mediaVariant = "carousel",
  introEmail,
  introForm = false,
  intro: introOverride,
  handoff: handoffOverride,
  cases,
  menu = false,
  brandingMotion = false,
  introBodyLowerExit = false,
}: BrandingSceneProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagsRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const formTitleRef = useRef<HTMLDivElement>(null);
  const formLockupRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const intro = { ...BRANDING_INTRO, ...introOverride };
  const handoff = { ...HUB_HANDOFF, ...handoffOverride };

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();
    const born = lastNow;
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
      hideWhenGone = true,
    ) => {
      if (!el) return;
      if (
        pullKind === "gallery" &&
        window.matchMedia("(pointer: coarse)").matches
      ) {
        paint(el, opacity, atRest ? 0 : blur, "none", hideWhenGone);
        el.style.transformStyle = "flat";
        return;
      }
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
        hideWhenGone,
      );
    };

    const extraCount =
      (introSubtitle ? 1 : 0) +
      (introLines.length ? 1 : 0) +
      (introTags.length ? 1 : 0) +
      (introEmail ? 1 : 0) +
      (introForm ? 1 : 0);
    const handoffs = introHandoffs(Math.max(extraCount - 1, 0));
    const lastReal = extraCount + 1;
    const packedExitGate =
      handoffs[lastReal]?.exitStart ?? ABOUT_INTRO.sequenceEnd;

    const introBodyHandoff =
      introLines.length > 0 ? 2 + (introSubtitle ? 1 : 0) : -1;

    const updateIntro = (progress: number, now: number, dt: number) => {
      const { stageFadeStart, stageFadeEnd, enterExitBlurPx } = ABOUT_INTRO;
      const stageFade = easeInOutCubic(
        clamp(
          (progress - stageFadeStart) /
            Math.max(stageFadeEnd - stageFadeStart, 0.0001),
          0,
          1,
        ),
      );
      if (stageRef.current) {
        stageRef.current.style.opacity = (1 - stageFade).toFixed(3);
        stageRef.current.style.pointerEvents =
          stageFade > 0.4 || progress >= packedExitGate ? "none" : "auto";
        stageRef.current.style.zIndex =
          stageFade > 0.15 || progress >= packedExitGate ? "1" : "20";
      }

      const applyElement = (
        el: HTMLElement | null,
        handoffIndex: number,
        blurScale = 1,
      ) => {
        if (!el) return;
        const win = handoffs[handoffIndex];
        if (!win) {
          paint(el, 0, enterExitBlurPx, "none");
          return;
        }
        const vis = handoffVisibility(
          progress,
          win,
          enterExitBlurPx * blurScale,
        );
        const lifeT =
          handoffIndex === 0 ? cueLifeT(progress, win) : vis.zoomT;
        const pose =
          introBodyLowerExit && handoffIndex === introBodyHandoff
            ? sampleIntroBodyPose(vis.zoomT)
            : brandingMotion
              ? sampleBrandingIntroPose(handoffIndex, vis.zoomT, lifeT)
              : sampleIntroPose(handoffIndex, vis.zoomT, lifeT);
        if (handoffIndex === 0) {
          pose.y += cueArriveY(now - born);
        }
        const loadBlend =
          handoffIndex === 1
            ? stepLoadClear(
                loadClear,
                dt,
                pageHasScrolled() || progress > 0.002,
              )
            : 0;
        const opacity =
          handoffIndex === 0 ? cueHoldOpacity(lifeT) : vis.opacity;
        const blur =
          (handoffIndex === 0 ? (1 - opacity) * enterExitBlurPx : vis.blur) +
          loadBlend * LOAD_CLEAR_BLUR_PX;
        const arriving =
          handoffIndex === 0 && now - born < ABOUT_INTRO.cueArriveMs;
        const atRest = !arriving && opacity >= 0.98 && blur < 0.4;
        const travelT = 1 - opacity;
        const pull = stepMousePull(
          pullFor(el),
          el,
          now,
          dt,
          handoffIndex <= 2 ? "title" : "body",
          1 - travelT,
        );
        paint(
          el,
          opacity,
          blur,
          composeIdleTransform(
            idleFor(el),
            poseToTransform(pose),
            now,
            dt,
            handoffIndex + 3,
            atRest,
            travelT,
            handoffIndex === 0 ? (arriving ? 0 : 2.2) : 1,
            pull,
          ),
        );
      };

      let handoffIndex = 0;
      applyElement(cueRef.current, handoffIndex++);
      applyElement(titleRef.current, handoffIndex++);
      if (introSubtitle) applyElement(subtitleRef.current, handoffIndex++);
      if (introLines.length) applyElement(lineRefs.current[0] ?? null, handoffIndex++);
      if (introTags.length) applyElement(tagsRef.current, handoffIndex++);
      if (introEmail) applyElement(emailRef.current, handoffIndex++);
      if (introForm) {
        const win = handoffs[handoffIndex];
        const paintFormPiece = (
          el: HTMLElement | null,
          seed: number,
          pullKind: MousePullKind,
          idleAmount: number,
        ) => {
          if (!el) return;
          if (!win) {
            paint(el, 0, ABOUT_INTRO.enterExitBlurPx, "none");
            return;
          }
          const vis = handoffVisibility(
            progress,
            win,
            ABOUT_INTRO.enterExitBlurPx * 0.7,
          );
          const u = 1 - vis.opacity;
          const transform = `translate3d(0, ${(16 * u).toFixed(2)}vh, 0) scale(${(1 + 0.18 * u).toFixed(4)})`;
          paintIdle(
            el,
            vis.opacity,
            vis.blur,
            transform,
            seed,
            now,
            dt,
            vis.opacity >= 0.98,
            u,
            idleAmount,
            pullKind,
          );
          el.style.pointerEvents = vis.opacity > 0.65 ? "auto" : "none";
        };
        paintFormPiece(formTitleRef.current, 8, "title", LOCKUP_IDLE);
        paintFormPiece(formLockupRef.current, 9, "body", 1);
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
        finaleProgress = pinProgress(finalePin);
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
      const lean = brandingMotion ? BRANDING_LEAN : TEXT_DIRECTIONAL_LEAN;
      let lastTitleAngle = arriveAngle(0);
      nodes.forEach((el) => {
        const kind = (el.dataset.kind || "copy") as ArriveKind;
        const lag = Number(el.dataset.lag || 0);
        const index = Number(el.dataset.angle || 0);
        let angle = arriveAngle(index);
        if (kind === "title") lastTitleAngle = angle;
        else if (kind === "copy" && !el.hasAttribute("data-still")) {
          angle = oppositeArriveAngle(lastTitleAngle);
        }
        const poseEl = (el.firstElementChild as HTMLElement) ?? el;
        el.style.transform = "none";
        el.style.filter = "none";
        if (poseEl !== el) {
          poseEl.style.transform = "none";
          poseEl.style.filter = "none";
        }
        let t = arriveT(visualRectTop(el), viewH, kind, lag);
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
            angle,
            kind,
            lean,
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
            kind !== "media",
          );
          return;
        }
        const pose = el.hasAttribute("data-grow")
          ? arriveGrowTransform(t, angle, kind, lean)
          : arriveTransform(t, angle, kind, lean);
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
          kind !== "media",
        );
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const pin = pinRef.current;
      if (!pin) return;
      applyPinStage(pin, stageRef.current);
      const progress = pinProgress(pin);
      updateIntro(progress, now, dt);
      updateArrivals(progress, packedExitGate, now, dt);
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      tick(now);
    };

    const onScroll = () => tick(performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);

    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
    };
  }, [introLines.length, introTags.length, introSubtitle, introEmail, introForm, finale, cases.length, brandingMotion, introBodyLowerExit, intro.pinHeightVh, intro.linesStart, intro.lineSpan, intro.holdAfter, intro.exitSpan, handoff.lead, handoff.span, handoff.finish]);

  let angleCursor =
    (introLines.length ? 1 : 0) +
    (introSubtitle ? 1 : 0) +
    (introTags.length ? 1 : 0) +
    (introEmail ? 1 : 0);

  return (
    <div ref={sceneRef} className="w-full max-w-[100vw]">
      <section
        ref={pinRef}
        className="relative w-full max-w-[100vw]"
        style={{ height: intro.pinHeightVh }}
        aria-label={`${introTitle} introduction`}
      >
        <div
          ref={stageRef}
          className="absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] items-center justify-center overflow-visible px-5 md:px-8 xl:px-12"
          style={{
            perspective: "1180px",
            perspectiveOrigin: "50% 50%",
            zIndex: 20,
          }}
        >
          <div
            className="relative z-10 h-full w-full max-w-full text-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 flex items-center justify-center px-2">
              <ScrollCue ref={cueRef} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center px-2">
              <div
                ref={titleRef}
                className="will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                  transformStyle: "preserve-3d",
                  filter: `blur(${LOAD_CLEAR_BLUR_PX}px)`,
                }}
              >
                <TitleShine as="h1" className={TITLE_CLASS}>
                  {introTitle}
                </TitleShine>
              </div>
            </div>

            {introSubtitle ? (
              <div className="absolute inset-0 flex items-center justify-center px-2">
                <div
                  ref={subtitleRef}
                  className="will-change-transform"
                  style={{
                    opacity: 0,
                    visibility: "hidden",
                    transformOrigin: "50% 50%",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <p className={SUBTITLE_CLASS}>
                    <MobileBreakText text={introSubtitle} />
                  </p>
                </div>
              </div>
            ) : null}

            {introLines.length ? (
              <div className="absolute inset-0 flex items-center justify-center px-3">
                <div
                  ref={(el) => {
                    lineRefs.current[0] = el;
                  }}
                  className="will-change-transform"
                  style={{
                    opacity: 0,
                    visibility: "hidden",
                    transformOrigin: "50% 50%",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <p className={`${BODY_CLASS} mx-auto mb-0 max-w-xl`}>
                    {preventOrphan(introLines.join(" "))}
                  </p>
                </div>
              </div>
            ) : null}

            {introTags.length ? (
              <div className="absolute inset-0 flex items-center justify-center px-3">
                <div
                  ref={tagsRef}
                  className="flex flex-col items-center gap-y-4 will-change-transform md:flex-row md:flex-wrap md:justify-center md:gap-x-8 md:gap-y-3"
                  style={{
                    opacity: 0,
                    visibility: "hidden",
                    transformOrigin: "50% 50%",
                    transformStyle: "preserve-3d",
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
              </div>
            ) : null}

            {introEmail ? (
              <div className="absolute inset-0 flex items-center justify-center px-2">
                <div
                  ref={emailRef}
                  className="will-change-transform"
                  style={{
                    opacity: 0,
                    visibility: "hidden",
                    transformOrigin: "50% 50%",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <EmailShineLink email={introEmail} />
                </div>
              </div>
            ) : null}

            {introForm ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto px-3 py-6 md:py-8">
                <div className="flex w-full max-w-lg flex-col items-center">
                  <div
                    ref={formTitleRef}
                    className="will-change-transform"
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                      transformOrigin: "50% 50%",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <TitleShine as="p" className={FORM_TITLE_CLASS}>
                      {contact.subtitle}
                    </TitleShine>
                  </div>
                  <div
                    ref={formLockupRef}
                    className="mt-8 w-full will-change-transform xl:mt-10"
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                      transformOrigin: "50% 50%",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <ContactForm />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {cases.length ? (
      <div
        className="relative z-[12] overflow-x-clip divide-y divide-line"
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
                  : study.form
                    ? "relative overflow-x-clip px-5 pb-[clamp(4.5rem,12vh,8rem)] pt-[clamp(7rem,24vh,12rem)] md:px-8 xl:px-12 xl:pb-[clamp(5.5rem,13vh,11rem)] xl:pt-[clamp(8rem,20vh,14rem)] 2xl:px-16"
                    : "relative overflow-x-clip px-5 py-[clamp(4.5rem,12vh,8rem)] md:px-8 xl:px-12 xl:py-[clamp(5.5rem,13vh,11rem)] 2xl:px-16"
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
                    ? { perspective: "1180px", perspectiveOrigin: "50% 42%" }
                    : undefined
                }
              >
                <div
                  data-arrive
                  data-kind="title"
                  data-angle={titleAngle}
                  className="will-change-transform"
                  style={{
                    opacity: 0,
                    transformOrigin: "50% 50%",
                  }}
                >
                  <TitleShine as="h2" className={study.form ? FORM_TITLE_CLASS : TITLE_CLASS}>
                    {study.title}
                  </TitleShine>
                </div>

                {subText ? (
                <div
                  data-arrive
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
                    data-still=""
                    data-kind="copy"
                    data-angle={formAngle}
                    data-lag={36}
                    className="mt-10 w-full max-w-lg will-change-transform xl:mt-12"
                    style={{ opacity: 0, transformOrigin: "50% 40%" }}
                  >
                    <ContactForm />
                  </div>
                ) : study.media?.length ? (
                  <ArriveMedia
                    items={study.media}
                    label={`${study.title} gallery`}
                    angle={mediaAngle}
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
      {menu ? <SeeMenuArrive angleStart={angleCursor} /> : null}
    </div>
  );
}

function ArriveMedia({
  items,
  label,
  angle,
  lag = 36,
  variant = "carousel",
}: {
  items: MediaItem[];
  label: string;
  angle: number;
  lag?: number;
  variant?: "carousel" | "plate";
}) {
  const plate = variant === "plate" ? items[0] : null;
  return (
    <div
      data-arrive
      data-kind="media"
      data-angle={angle}
      data-lag={lag}
      className="mt-12 w-full max-w-5xl md:will-change-transform xl:mt-14 xl:max-w-6xl 2xl:max-w-7xl"
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
