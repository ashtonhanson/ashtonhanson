"use client";

import { useEffect, useRef } from "react";
import { MobileBreakText } from "@/components/MobileBreakText";
import { ScrollCue } from "@/components/ScrollCue";
import { TitleShine } from "@/components/TitleShine";
import {
  ABOUT_INTRO,
  clamp,
  cueArriveY,
  cueHoldOpacity,
  cueLifeT,
  easeInOutCubic,
  handoffVisibility,
  introHandoffs,
  poseToTransform,
  sampleIntroPose,
} from "@/lib/cinematicDepth";
import {
  createIdleHoverState,
  composeIdleTransform,
  type IdleHoverState,
} from "@/lib/idleHover";
import {
  createMousePullState,
  stepMousePull,
} from "@/lib/mousePull";
import {
  createLoadClearState,
  LOAD_CLEAR_BLUR_PX,
  applyPinStage,
  pageHasScrolled,
  stepLoadClear,
  viewHeight,
} from "@/lib/loadClear";

type AboutIntroStageProps = {
  aboutWord: string;
  meWord: string;
  /** One complete straight line per entry (no mid-phrase wrap). */
  bodyLines: string[];
  /** Fires with 0–1 progress through this sticky intro chapter. */
  onProgress?: (progress: number) => void;
};

function applyHandoffStyle(
  el: HTMLElement,
  opacity: number,
  blur: number,
  transform: string,
) {
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  el.style.transformStyle = "preserve-3d";
  el.style.transform = transform;
  el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
}

/**
 * Sticky ABOUT chapter — metallic down-arrow on load, then ABOUT → ME → body.
 * Cue drops in from the top, hovers, then blows past the camera.
 * ABOUT arrives small and blurry on Z, then expands through the existing surge.
 */
export function AboutIntroStage({
  aboutWord,
  meWord,
  bodyLines,
  onProgress,
}: AboutIntroStageProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();
    const born = lastNow;
    const handoffs = introHandoffs(bodyLines.length);
    const idleMap = new WeakMap<HTMLElement, IdleHoverState>();
    const pullMap = new WeakMap<HTMLElement, ReturnType<typeof createMousePullState>>();
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

    let lastProgress = Number.NaN;

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;

      const pin = pinRef.current;
      if (!pin) return;
      applyPinStage(pin, stageRef.current);

      const rect = pin.getBoundingClientRect();
      const viewH = viewHeight();
      const range = pin.offsetHeight - viewH;
      const progress =
        range < 64 ? 0 : clamp(-rect.top / Math.max(range, 1), 0, 1);
      if (progress !== lastProgress) {
        lastProgress = progress;
        onProgress?.(progress);
      }

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
          stageFade > 0.4 ? "none" : "auto";
        stageRef.current.style.zIndex = stageFade > 0.15 ? "1" : "20";
      }

      const applyElement = (
        el: HTMLElement | null,
        handoffIndex: number,
        blurScale = 1,
      ) => {
        if (!el) return;
        const win = handoffs[handoffIndex];
        if (!win) {
          applyHandoffStyle(el, 0, enterExitBlurPx, "none");
          return;
        }
        const vis = handoffVisibility(
          progress,
          win,
          enterExitBlurPx * blurScale,
        );
        const lifeT =
          handoffIndex === 0 ? cueLifeT(progress, win) : vis.zoomT;
        const pose = sampleIntroPose(handoffIndex, vis.zoomT, lifeT);
        if (handoffIndex === 0) {
          pose.y += cueArriveY(now - born);
        }
        const transform = poseToTransform(pose);
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
        applyHandoffStyle(
          el,
          opacity,
          blur,
          composeIdleTransform(
            idleFor(el),
            transform,
            now,
            dt,
            handoffIndex + 3,
            atRest,
            travelT,
            handoffIndex === 0 ? (arriving ? 0 : 6.8) : 1,
            pull,
          ),
        );
      };

      applyElement(cueRef.current, 0);
      applyElement(aboutRef.current, 1);
      applyElement(meRef.current, 2);
      lineRefs.current.forEach((el, index) => {
        applyElement(el, 3 + index, 0.85);
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [bodyLines, onProgress, aboutWord, meWord]);

  return (
    <section
      ref={pinRef}
      className="about-intro-pin relative"
      style={{ height: ABOUT_INTRO.pinHeightVh }}
      aria-label="About introduction"
    >
      <div
        ref={stageRef}
        className="about-intro-stage absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] items-center justify-center overflow-visible px-5 md:px-8 xl:px-12"
        style={{
          perspective: "1400px",
          perspectiveOrigin: "50% 50%",
          zIndex: 20,
        }}
      >
        {/* Absolute stack — each element takes center stage in turn */}
        <div
          className="relative z-10 h-full w-full text-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <ScrollCue ref={cueRef} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={aboutRef}
              className="intro-layer is-about will-change-transform"
              style={{
                opacity: 0,
                visibility: "hidden",
                filter: `blur(${LOAD_CLEAR_BLUR_PX}px)`,
                transformOrigin: "50% 50%",
                transformStyle: "preserve-3d",
              }}
            >
              <TitleShine
                as="h1"
                className="pointer-events-none select-none font-display text-[clamp(3.2rem,14vw,8rem)] font-black uppercase leading-[0.88] tracking-[0.04em] xl:text-[clamp(5rem,10vw,9.5rem)]"
              >
                {aboutWord}
              </TitleShine>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={meRef}
              className="intro-layer will-change-transform"
              style={{
                opacity: 0,
                visibility: "hidden",
                transformOrigin: "50% 50%",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Identical treatment + type to ABOUT (short word → slightly larger letters) */}
              <TitleShine
                as="h2"
                className="pointer-events-none select-none font-display text-[clamp(4.5rem,22vw,12rem)] font-black uppercase leading-[0.88] tracking-[0.04em] xl:text-[clamp(7rem,16vw,14rem)]"
              >
                {meWord}
              </TitleShine>
            </div>
          </div>

          {bodyLines.map((line, index) => (
            <div
              key={line}
              className="absolute inset-0 flex items-center justify-center px-3"
            >
              <div
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                className="intro-layer will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Cream readable type; zoom path starts small → much larger */}
                <p className="whitespace-nowrap text-center font-display text-[clamp(1.12rem,3.4vw,2.4rem)] font-medium leading-[1.3] tracking-[0.02em] text-[rgb(232_223_196)] xl:text-[clamp(1.65rem,2.8vw,2.6rem)]">
                  <MobileBreakText text={line} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
