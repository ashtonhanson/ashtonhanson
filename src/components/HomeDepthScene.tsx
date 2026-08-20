"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AboutIntroStage } from "@/components/AboutIntroStage";
import {
  arriveAngle,
  arriveTransform,
  clamp,
  shrinkOutPose,
  type ArriveKind,
} from "@/lib/brandingMotion";
import { chapterWindows, HOME_CHAPTER, windowT } from "@/lib/homeMotion";
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

type HomeDepthSceneProps = {
  aboutWord: string;
  meWord: string;
  aboutLines: string[];
  gallery: ReactNode;
  menu: ReactNode;
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
  const viewH = window.innerHeight || 1;
  const range = pin.offsetHeight - viewH;
  const rect = pin.getBoundingClientRect();
  return range < 64 ? 0 : clamp(-rect.top / Math.max(range, 1), 0, 1);
}

/**
 * Home cinematic scroll:
 * 1) Sticky ABOUT intro
 * 2) RECENT WORK / AI ANIMATION / gallery — unique-angle enter, hold, FIFO exit
 * 3) SEE MENU / FOR OTHER / WORK — same treatment
 */
export function HomeDepthScene({
  aboutWord,
  meWord,
  aboutLines,
  gallery,
  menu,
}: HomeDepthSceneProps) {
  const galleryPinRef = useRef<HTMLElement>(null);
  const menuPinRef = useRef<HTMLElement>(null);

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

    const paintItem = (
      el: HTMLElement,
      opacity: number,
      blur: number,
      transform: string,
      atRest: boolean,
      seed: number,
      now: number,
      dt: number,
      travelT = 0,
      pullKind: MousePullKind | null = "title",
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
          seed,
          atRest,
          travelT,
          1,
          pull,
        ),
      );
    };

    const paintChapter = (
      pin: HTMLElement | null,
      angleOffset: number,
      now: number,
      dt: number,
    ) => {
      if (!pin) return;
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
          kind === "media" ? "gallery" : kind === "title" ? "title" : "subtitle";

        if (progress >= out.start) {
          const pose = shrinkOutPose(windowT(progress, out), angle);
          el.style.transformOrigin = pose.origin;
          paintItem(
            el,
            pose.opacity,
            pose.blur,
            pose.transform,
            false,
            i + angleOffset,
            now,
            dt,
            pose.travelT,
            pullKind,
          );
          return;
        }

        const t = windowT(progress, inn);
        const pose = arriveTransform(t, angle, kind);
        el.style.transformOrigin = pose.origin;
        paintItem(
          el,
          pose.opacity,
          pose.blur,
          pose.transform,
          t >= 0.985,
          i + angleOffset,
          now,
          dt,
          1 - t,
          pullKind,
        );
      });
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      paintChapter(galleryPinRef.current, 0, now, dt);
      paintChapter(menuPinRef.current, 4, now, dt);
    };

    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const stageClass =
    "sticky top-[3.6rem] flex h-[calc(100dvh-3.6rem)] flex-col items-center justify-center overflow-visible px-5 md:px-8 xl:px-12 2xl:px-16";

  return (
    <div className="home-depth-scene">
      <AboutIntroStage
        aboutWord={aboutWord}
        meWord={meWord}
        bodyLines={aboutLines}
      />

      <section
        ref={galleryPinRef}
        className="relative z-[12]"
        style={{
          height: HOME_CHAPTER.galleryPinVh,
          marginTop: HOME_CHAPTER.overlapAbout,
        }}
        aria-label="Recent work"
      >
        <div className={stageClass}>{gallery}</div>
      </section>

      <section
        ref={menuPinRef}
        className="relative z-[14]"
        style={{
          height: HOME_CHAPTER.menuPinVh,
          marginTop: HOME_CHAPTER.overlapGallery,
        }}
        aria-label="See menu"
      >
        <div className={stageClass}>{menu}</div>
      </section>
    </div>
  );
}
