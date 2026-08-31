"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  arriveAngle,
  oppositeArriveAngle,
  arriveGrowTransform,
  arriveTransform,
  finaleExitPose,
  shrinkOutPose,
  type ArriveKind,
} from "@/lib/brandingMotion";
import { chapterWindows, windowT } from "@/lib/homeMotion";
import { applyPinStage, pinProgress } from "@/lib/loadClear";
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
  exitMode?: "shrink" | "scale" | "hold";
  zIndex?: number;
  perspective?: boolean;
  stageClassName?: string;
  "aria-label"?: string;
};

function paint(
  el: HTMLElement,
  opacity: number,
  blur: number,
  transform: string,
  flat = false,
) {
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  el.style.transformStyle = flat ? "flat" : "preserve-3d";
  el.style.transform = transform;
  el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
  el.style.pointerEvents =
    opacity > (el.dataset.kind === "title" ? 0.65 : 0.05) ? "auto" : "none";
}

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}


/**
 * Sticky lockup that brings `[data-home-arrive]` pieces in from unique
 * angles, holds, then shrinks or scales them out.
 */
export function CinematicChapter({
  children,
  pinHeight,
  overlap,
  angleOffset = 0,
  exitMode = "shrink",
  zIndex = 14,
  perspective = false,
  stageClassName = "",
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
      const nodes = [
        ...pin.querySelectorAll<HTMLElement>("[data-home-arrive]"),
      ].sort(
        (a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0),
      );
      const stage = stageRef.current;
      if (stage) {
        const use3d =
          perspective &&
          !(
            isCoarsePointer() &&
            nodes.some((node) => node.dataset.kind === "media")
          );
        stage.style.perspective = use3d ? "1180px" : "none";
        stage.style.perspectiveOrigin = use3d ? "50% 42%" : "";
      }
      if (!nodes.length) return;

      const progress = pinProgress(pin);
      const { ins, outs } = chapterWindows(nodes.length);
      let lastTitleAngle = arriveAngle(angleOffset);

      nodes.forEach((el, i) => {
        const kind = (el.dataset.kind || "copy") as ArriveKind;
        let angle = arriveAngle(i + angleOffset);
        if (kind === "title") lastTitleAngle = angle;
        else if (kind === "copy") angle = oppositeArriveAngle(lastTitleAngle);
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
          // Keep galleries flat while at rest so overflow-x / drag work.
          // Android Chrome paints <video> black inside 3D ancestors.
          if (kind === "media" && (isCoarsePointer() || atRest)) {
            paint(el, opacity, atRest ? 0 : blur, "none", true);
            return;
          }
          const pull =
            pullKind &&
            pullKind !== "gallery" &&
            opacity > 0.04
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
              kind === "media" ? false : atRest,
              travelT,
              kind === "media" ? 0 : 1,
              pull,
            ),
          );
        };

        if (exitMode !== "hold" && progress >= out.start) {
          const exitT = windowT(progress, out);
          const pose =
            exitMode === "scale"
              ? finaleExitPose(exitT, angle, kind)
              : shrinkOutPose(exitT, angle, kind);
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
        const pose = el.hasAttribute("data-grow")
          ? arriveGrowTransform(t, angle, kind)
          : arriveTransform(t, angle, kind);
        el.style.transformOrigin = pose.origin;
        paintItem(pose.opacity, pose.blur, pose.transform, t >= 0.985, 1 - t);
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [angleOffset, exitMode, perspective]);

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
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] flex-col items-center justify-center overflow-clip px-5 md:px-8 xl:px-12 2xl:px-16 ${stageClassName}`.trim()}
        style={
          perspective
            ? { perspective: "1180px", perspectiveOrigin: "50% 42%" }
            : undefined
        }
      >
        {children}
      </div>
    </section>
  );
}
