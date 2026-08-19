"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AboutIntroStage } from "@/components/AboutIntroStage";
import {
  DEPTH,
  poseFromProgress,
  poseToTransform,
  rawProgressForPanel,
} from "@/lib/cinematicDepth";

type HomeDepthSceneProps = {
  aboutWord: string;
  meWord: string;
  aboutLines: string[];
  gallery: ReactNode;
  menu: ReactNode;
};

/**
 * Home cinematic scroll:
 * 1) Sticky ABOUT intro (ABOUT → ME → body lines, each on a unique Z path)
 * 2) RECENT WORK / gallery / menu always in flow after the intro — never hard-hidden
 */
export function HomeDepthScene({
  aboutWord,
  meWord,
  aboutLines,
  gallery,
  menu,
}: HomeDepthSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const applyPose = (el: HTMLElement, progress: number, mobile: boolean) => {
      if (mq.matches) {
        el.style.transform = "none";
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.visibility = "visible";
        return;
      }

      el.style.visibility = "visible";
      el.style.pointerEvents = "auto";

      const pose = poseFromProgress(progress, {
        voidZ: mobile ? DEPTH.mobileVoidZ : DEPTH.voidZ,
        recedeZ: mobile ? DEPTH.mobileRecedeZ : DEPTH.recedeZ,
        sway: el === galleryRef.current ? 1 : -1,
      });

      el.style.transform = poseToTransform(pose);
      el.style.opacity = pose.opacity.toFixed(3);
      el.style.filter =
        pose.blur > 0.08 ? `blur(${pose.blur.toFixed(2)}px)` : "none";
    };

    const update = () => {
      frame = 0;
      const viewH = window.innerHeight || 1;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const panels = [galleryRef.current, menuRef.current];

      for (const el of panels) {
        if (!el) continue;
        const progress = rawProgressForPanel(el, viewH);
        applyPose(el, progress, mobile);
      }
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
  }, []);

  const sceneStyle = {
    perspective: `${DEPTH.perspectivePx}px`,
    perspectiveOrigin: DEPTH.perspectiveOrigin,
  } as CSSProperties;

  return (
    <div ref={sceneRef} className="home-depth-scene">
      <AboutIntroStage
        aboutWord={aboutWord}
        meWord={meWord}
        bodyLines={aboutLines}
      />

      <div style={sceneStyle}>
        <div className="home-depth-rest">
          <div
            ref={galleryRef}
            className="home-depth-panel relative overflow-hidden border-t border-line px-5 pb-[clamp(4.5rem,12vh,8rem)] pt-[clamp(3.5rem,9vh,5.5rem)] md:px-8 xl:px-12 xl:pb-[clamp(5.5rem,13vh,11rem)] xl:pt-[clamp(4.25rem,10vh,7rem)] 2xl:px-16"
          >
            {gallery}
          </div>

          <div
            ref={menuRef}
            className="home-depth-panel relative overflow-hidden"
          >
            {menu}
          </div>
        </div>
      </div>
    </div>
  );
}
