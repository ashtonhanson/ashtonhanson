"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  arriveAngle,
  arriveTransform,
  clamp,
  finaleExitPose,
  shrinkOutPose,
  type ArriveKind,
} from "@/lib/brandingMotion";
import { chapterWindows, windowT } from "@/lib/homeMotion";
import { applyPinStage, viewHeight } from "@/lib/loadClear";
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

type CinematicChapterProps = {
  children: ReactNode;
  pinHeight: string;
  overlap?: string;
  angleOffset?: number;
  exitMode?: "shrink" | "scale";
  zIndex?: number;
  perspective?: boolean;
  "aria-label"?: string;
};

function paint(
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
  el.style.pointerEvents = opacity > 0.65 ? "auto" : "none";
}

function pinProgress(pin: HTMLElement) {
  const viewH = viewHeight();
  const range = pin.offsetHeight - viewH;
  const rect = pin.getBoundingClientRect();
  return range < 64 ? 0 : clamp(-rect.top / Math.max(range, 1), 0, 1);
}

/**
 * Sticky lockup that brings `[data-home-arrive]` pieces in from unique
 * angles, holds, then shrinks or scales them out — same as home chapters.
 */
export function CinematicChapter({
  children,
  pinHeight,
  overlap,
  angleOffset = 0,
  exitMode = "shrink",
  zIndex = 14,
  perspective = false,
  "aria-label": ariaLabel,
}: CinematicChapterProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();
    const idleMap = new WeakMap<HTMLElement, IdleHoverState>();
    const pullMap = new WeakMap<HTMLElement, MousePullState>();

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

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const pin = pinRef.current;
      if (!pin) return;
      applyPinStage(pin, stageRef.current);
      const progress = pinProgress(pin);
      const nodes = [
        ...pin.querySelectorAll<HTMLElement>("[data-home-arrive]"),
      ].sort(
        (a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0),
      );
      if (!nodes.length) return;

      const { ins, outs } = chapterWindows(nodes.length);

      nodes.forEach((el, i) => {
        const kind = (el.dataset.kind || "copy") as ArriveKind;
        const angle = arriveAngle(i + angleOffset);
        const inn = ins[i];
        const out = outs[i];
        if (!inn || !out) return;

        const pullKind: MousePullKind | null =
          kind === "media"
            ? "gallery"
            : kind === "title"
              ? "title"
              : "subtitle";

        const paintItem = (
          opacity: number,
          blur: number,
          transform: string,
          atRest: boolean,
          travelT: number,
        ) => {
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
              i + angleOffset,
              atRest,
              travelT,
              1,
              pull,
            ),
          );
        };

        if (progress >= out.start) {
          const exitT = windowT(progress, out);
          const pose =
            exitMode === "scale"
              ? finaleExitPose(exitT, angle, kind)
              : shrinkOutPose(exitT, angle);
          el.style.transformOrigin = pose.origin;
          paintItem(
            pose.opacity,
            pose.blur,
            pose.transform,
            false,
            pose.travelT,
          );
          return;
        }

        const t = windowT(progress, inn);
        const pose = arriveTransform(t, angle, kind);
        el.style.transformOrigin = pose.origin;
        paintItem(pose.opacity, pose.blur, pose.transform, t >= 0.985, 1 - t);
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [angleOffset, exitMode]);

  const pinStyle: CSSProperties = {
    height: pinHeight,
    zIndex,
  };
  if (overlap) pinStyle.marginTop = overlap;

  return (
    <section
      ref={pinRef}
      className="relative"
      style={pinStyle}
      aria-label={ariaLabel}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] flex-col items-center justify-center overflow-clip px-5 md:px-8 xl:px-12 2xl:px-16"
        style={
          perspective
            ? { perspective: "1400px", perspectiveOrigin: "50% 42%" }
            : undefined
        }
      >
        {children}
      </div>
    </section>
  );
}
