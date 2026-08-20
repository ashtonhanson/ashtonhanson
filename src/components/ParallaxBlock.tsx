"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MobileBreakText } from "@/components/MobileBreakText";
import { TitleShine } from "@/components/TitleShine";
import {
  createIdleHoverState,
  composeIdleTransform,
  type IdleHoverState,
} from "@/lib/idleHover";
import { createMousePullState, stepMousePull } from "@/lib/mousePull";
import {
  createLoadClearState,
  LOAD_CLEAR_BLUR_PX,
  pageHasScrolled,
  stepLoadClear,
} from "@/lib/loadClear";

/**
 * Shared parallax title + copy stack used on every page section.
 *
 * Title and subtitle share the same vertical parallax / blur behavior
 * (no horizontal travel). Motion is measured from a stable layout anchor.
 */
export function ParallaxBlock({
  title,
  subtitle,
  subtitleTravel: _subtitleTravel = true,
  subtitleReverse: _subtitleReverse = false,
  as = "h2",
  children,
  className = "",
  /** When false, skip Y-parallax / blur (used under home Z-depth scene). */
  motion = true,
}: {
  title: string;
  subtitle?: string;
  /** @deprecated Horizontal travel removed — kept for call-site compatibility. */
  subtitleTravel?: boolean;
  /** @deprecated Horizontal travel removed — kept for call-site compatibility. */
  subtitleReverse?: boolean;
  as?: "h1" | "h2";
  children: ReactNode;
  className?: string;
  motion?: boolean;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(mq.matches);
    syncReduced();
    mq.addEventListener("change", syncReduced);
    return () => mq.removeEventListener("change", syncReduced);
  }, []);

  useEffect(() => {
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const hasSubtitle = Boolean(subtitle);
    const titleIdle = createIdleHoverState();
    const subtitleIdle = createIdleHoverState();
    const titlePull = createMousePullState();
    const subtitlePull = createMousePullState();
    const loadClear = createLoadClearState();
    const revealOnScroll = as === "h1";

    let frame = 0;
    let lastNow = performance.now();

    const paint = (
      el: HTMLElement,
      state: IdleHoverState,
      pull: ReturnType<typeof createMousePullState>,
      opacity: number,
      blur: number,
      transform: string,
      now: number,
      dt: number,
      seed: number,
      kind: "title" | "subtitle",
    ) => {
      const travelT = Math.min(1, blur / 9);
      const pulled = reduced
        ? undefined
        : stepMousePull(pull, el, now, dt, kind, 1 - travelT);
      el.style.transform = composeIdleTransform(
        state,
        transform,
        now,
        dt,
        seed,
        travelT < 0.08 && opacity > 0.9,
        travelT,
        1,
        pulled,
      );
      el.style.transformStyle = "preserve-3d";
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      el.style.opacity = String(opacity);
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;

      let y = 0;
      let blur = 0;
      let opacity = 1;

      if (motion && !reduced) {
        const anchor = anchorRef.current;
        if (anchor) {
          const viewH = window.innerHeight || 1;
          const rect = anchor.getBoundingClientRect();
          const naturalCenter = rect.top + rect.height / 2;
          const idealY = viewH * 0.25;
          const pastIdeal = idealY - naturalCenter;
          y = Math.max(-24, Math.min(132, pastIdeal * 0.55));

          const blurMax = 9;
          const exitEnd = Math.max(88, viewH * 0.11);
          const exitStart = Math.max(20, viewH * 0.02);
          blur =
            naturalCenter >= exitEnd
              ? 0
              : Math.min(
                  blurMax,
                  ((exitEnd - naturalCenter) /
                    Math.max(1, exitEnd - exitStart)) *
                    blurMax,
                );
          opacity = blur > 0.05 ? Math.max(0.42, 1 - blur / 14) : 1;
        }
      }

      const loadBlend = revealOnScroll
        ? stepLoadClear(loadClear, dt, pageHasScrolled())
        : 0;
      const loadBlur = loadBlend * LOAD_CLEAR_BLUR_PX;

      if (titleEl) {
        paint(
          titleEl,
          titleIdle,
          titlePull,
          opacity,
          blur + loadBlur,
          `translate3d(0, ${y.toFixed(2)}px, 0)`,
          now,
          dt,
          7,
          "title",
        );
      }
      if (subtitleEl) {
        const followY = y + (hasSubtitle ? 10 : 0);
        paint(
          subtitleEl,
          subtitleIdle,
          subtitlePull,
          opacity,
          blur * 0.85 + loadBlur * 0.85,
          `translate3d(-50%, ${followY.toFixed(2)}px, 0)`,
          now,
          dt,
          12,
          "subtitle",
        );
      }
    };

    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [reduced, subtitle, motion, as]);

  return (
    <div className={`relative mx-auto max-w-3xl text-center xl:max-w-4xl 2xl:max-w-5xl ${className}`}>
      <div
        className={`relative z-0 flex justify-center ${
          subtitle
            ? "min-h-[clamp(6.5rem,20vh,11rem)] items-end pb-[clamp(3.5rem,9vh,5.25rem)] pt-[clamp(0.25rem,1.5vh,1rem)] xl:min-h-[clamp(7.5rem,22vh,13rem)] xl:pb-[clamp(4rem,10vh,6.5rem)]"
            : "min-h-[clamp(4.75rem,17vh,9rem)] items-end pb-[clamp(2.25rem,6.5vh,3.75rem)] pt-[clamp(0.25rem,1.5vh,1rem)] xl:min-h-[clamp(5.75rem,18vh,11rem)] xl:pb-[clamp(2.75rem,7.5vh,4.75rem)]"
        }`}
      >
        <div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 flex-col items-center overflow-x-clip px-5 xl:px-10">
          <div ref={anchorRef} className="relative">
            <TitleShine
              as={as}
              ref={titleRef}
              className="pointer-events-none select-none whitespace-pre-line text-center font-display text-[clamp(2.6rem,10.5vw,6rem)] font-black uppercase leading-[0.9] tracking-[0.04em] xl:text-[clamp(3.4rem,6.2vw,7.75rem)]"
              style={{
                willChange: "transform, filter, opacity",
                ...(as === "h1"
                  ? { filter: `blur(${LOAD_CLEAR_BLUR_PX}px)` }
                  : {}),
              }}
            >
              {title}
            </TitleShine>
          </div>

          {subtitle ? (
            <h3
              ref={subtitleRef}
              className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] w-max max-w-none -translate-x-1/2 select-none text-center font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground xl:text-[clamp(1.35rem,1.55vw,1.7rem)]"
              style={{
                willChange: "transform, filter, opacity",
                ...(as === "h1"
                  ? { filter: `blur(${LOAD_CLEAR_BLUR_PX * 0.85}px)` }
                  : {}),
              }}
            >
              <MobileBreakText text={subtitle} />
            </h3>
          ) : null}
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
