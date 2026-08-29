"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  ABOUT_INTRO,
  clamp,
  easeInOutCubic,
  handoffVisibility,
  poseToTransform,
  sampleSectionPose,
  sectionHandoffs,
  sectionPinHeightVh,
} from "@/lib/cinematicDepth";
import {
  createIdleHoverState,
  composeIdleTransform,
  type IdleHoverState,
} from "@/lib/idleHover";
import { applyPinStage, pinProgress } from "@/lib/loadClear";
import {
  createMousePullState,
  stepMousePull,
  type MousePullKind,
  type MousePullState,
} from "@/lib/mousePull";

type ZHandoffChapterProps = {
  children: ReactNode;
  itemCount: number;
  overlap?: string;
  zIndex?: number;
  poseOffset?: number;
  stageClassName?: string;
  id?: string;
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
    opacity > (el.dataset.kind === "media" ? 0.05 : 0.65) ? "auto" : "none";
}

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Sticky chapter — each `[data-z-item]` takes center stage in turn,
 * scaling on Z the same way ABOUT / ME / body copy do.
 */
export function ZHandoffChapter({
  children,
  itemCount,
  overlap,
  zIndex = 12,
  poseOffset = 0,
  stageClassName = "",
  id,
  "aria-label": ariaLabel,
}: ZHandoffChapterProps) {
  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();
    const idleMap = new WeakMap<HTMLElement, IdleHoverState>();
    const pullMap = new WeakMap<HTMLElement, MousePullState>();
    const handoffs = sectionHandoffs(itemCount);

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
      const stage = stageRef.current;
      if (!pin) return;
      applyPinStage(pin, stage);

      const nodes = [
        ...pin.querySelectorAll<HTMLElement>("[data-z-item]"),
      ].sort(
        (a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0),
      );
      if (stage) {
        const use3d = !(
          isCoarsePointer() &&
          nodes.some((node) => node.dataset.kind === "media")
        );
        stage.style.perspective = use3d ? "1180px" : "none";
        stage.style.perspectiveOrigin = use3d ? "50% 42%" : "";
      }
      if (!nodes.length) return;

      const progress = pinProgress(pin);
      const { stageFadeStart, stageFadeEnd, enterExitBlurPx } = ABOUT_INTRO;
      const stageFade = easeInOutCubic(
        clamp(
          (progress - stageFadeStart) /
            Math.max(stageFadeEnd - stageFadeStart, 0.0001),
          0,
          1,
        ),
      );
      if (stage) {
        stage.style.opacity = (1 - stageFade).toFixed(3);
      }

      nodes.forEach((el, i) => {
        const win = handoffs[i];
        if (!win) {
          paint(el, 0, enterExitBlurPx, "none");
          return;
        }
        const kind = (el.dataset.kind || "copy") as
          | "title"
          | "copy"
          | "media";
        const vis = handoffVisibility(progress, win, enterExitBlurPx);
        const pose = sampleSectionPose(i + poseOffset, vis.zoomT, kind);
        const transform =
          vis.opacity < 0.02 ? "none" : poseToTransform(pose);

        if (kind === "media" && isCoarsePointer()) {
          paint(el, vis.opacity, vis.opacity >= 0.98 ? 0 : vis.blur, "none", true);
          return;
        }

        const atRest = vis.opacity >= 0.98 && vis.blur < 0.4;
        const travelT = 1 - vis.opacity;
        const pullKind: MousePullKind | null =
          kind === "media"
            ? null
            : kind === "title"
              ? "title"
              : "subtitle";
        const pull =
          pullKind && vis.opacity > 0.04
            ? stepMousePull(
                pullFor(el),
                el,
                now,
                dt,
                pullKind,
                1 - travelT,
              )
            : undefined;

        paint(
          el,
          vis.opacity,
          vis.blur,
          composeIdleTransform(
            idleFor(el),
            transform,
            now,
            dt,
            i + poseOffset + 4,
            atRest && kind !== "media",
            travelT,
            kind === "media" ? 0 : 1,
            pull,
          ),
        );
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [itemCount, poseOffset]);

  const pinStyle: CSSProperties = {
    height: sectionPinHeightVh(itemCount),
    zIndex,
  };
  if (overlap) pinStyle.marginTop = overlap;

  return (
    <section
      ref={pinRef}
      id={id}
      className="relative w-full max-w-[100vw]"
      style={pinStyle}
      aria-label={ariaLabel}
    >
      <div
        ref={stageRef}
        className={`z-handoff-stage pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[calc(100dvh-3.6rem)] items-center justify-center overflow-clip px-5 md:px-8 xl:px-12 2xl:px-16 ${stageClassName}`.trim()}
        style={{ perspective: "1180px", perspectiveOrigin: "50% 42%" }}
      >
        <div className="relative h-full w-full max-w-full text-center">
          {children}
        </div>
      </div>
    </section>
  );
}
