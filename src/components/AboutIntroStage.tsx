"use client";

import { useEffect, useRef } from "react";
import { TitleShine } from "@/components/TitleShine";
import {
  ABOUT_INTRO,
  clamp,
  easeInOutCubic,
  handoffVisibility,
  introHandoffs,
  poseToTransform,
  sampleIntroPose,
} from "@/lib/cinematicDepth";

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
  _blur: number,
  transform: string,
) {
  el.style.opacity = opacity.toFixed(3);
  // Never soft-focus intro type — opacity handoffs only
  el.style.filter = "none";
  el.style.transform = transform;
  el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
}

/**
 * Sticky ABOUT chapter — ABOUT sharp on load, then one-at-a-time handoffs.
 * Each element rides a distinct Z-scale path, blurs out as the next blurs in.
 */
export function AboutIntroStage({
  aboutWord,
  meWord,
  bodyLines,
  onProgress,
}: AboutIntroStageProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const handoffs = introHandoffs(bodyLines.length);

    const update = () => {
      frame = 0;
      const pin = pinRef.current;
      if (!pin) return;

      const rect = pin.getBoundingClientRect();
      const scrollable = Math.max(pin.offsetHeight - window.innerHeight, 1);
      const raw = clamp(-rect.top / scrollable, 0, 1);
      const progress = mq.matches ? 1 : raw;
      onProgress?.(progress);

      if (mq.matches) {
        if (stageRef.current) {
          stageRef.current.style.opacity = "1";
          stageRef.current.style.zIndex = "20";
          stageRef.current.style.pointerEvents = "auto";
        }
        if (aboutRef.current) {
          applyHandoffStyle(aboutRef.current, 1, 0, "none");
        }
        if (meRef.current) {
          applyHandoffStyle(meRef.current, 1, 0, "none");
        }
        lineRefs.current.forEach((el) => {
          if (el) applyHandoffStyle(el, 1, 0, "none");
        });
        return;
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
        // Drop under RECENT WORK as soon as the sequence starts clearing
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
        // Same Z/scale curve as ABOUT — completes while still sharp
        const pose = sampleIntroPose(handoffIndex, vis.zoomT);
        applyHandoffStyle(el, vis.opacity, vis.blur, poseToTransform(pose));
      };

      applyElement(aboutRef.current, 0);
      applyElement(meRef.current, 1);
      lineRefs.current.forEach((el, index) => {
        applyElement(el, 2 + index, 0.85);
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
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
        className="about-intro-stage sticky top-0 flex h-dvh items-center justify-center px-5 md:px-8 xl:px-12"
        style={{
          perspective: "1400px",
          perspectiveOrigin: "50% 50%",
          overflow: "visible",
          zIndex: 20,
        }}
      >
        {/* Absolute stack — each element takes center stage in turn */}
        <div
          className="relative z-10 h-full w-full text-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={aboutRef}
              className="will-change-transform"
              style={{
                opacity: 1,
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
              className="will-change-transform"
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
                className="will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Cream readable type; zoom path starts small → much larger */}
                <p className="whitespace-nowrap font-display text-[clamp(1.5rem,3.6vw,2.4rem)] font-medium leading-[1.35] tracking-[0.02em] text-[rgb(232_223_196)] xl:text-[clamp(1.65rem,2.8vw,2.6rem)]">
                  {line}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
