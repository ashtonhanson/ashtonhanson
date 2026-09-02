"use client";

import { forwardRef, type AnimationEvent, type CSSProperties } from "react";
import { ABOUT_INTRO } from "@/lib/cinematicDepth";

/** Yellow arrow from the mark, flipped to point down as a scroll cue. */
const LOGO_ARROW_PATH =
  "M130.3,48.8L48.9,217.3c-3.9,6.2,5.5,12.9,12.3,7.8l70.9-52.2c2.2-1.5,5.2-1.5,7.4,0l70.9,52.2c6.8,5.2,16-2.3,13.2-7.4l-82.3-169C139.3,44.3,132.5,44.3,130.3,48.8z";

function freezeArrive(el: HTMLElement, snapToRest: boolean) {
  if (el.dataset.locked === "1") return;
  el.dataset.locked = "1";
  el.style.animation = "none";
  if (snapToRest) {
    el.style.transform = `translate3d(0, ${ABOUT_INTRO.cueRestY}vh, 0)`;
    return;
  }
  const current = getComputedStyle(el).transform;
  el.style.transform =
    current && current !== "none"
      ? current
      : `translate3d(0, ${ABOUT_INTRO.cueRestY}vh, 0)`;
}

/** Same drop/scale intro as the live cue, using the mark's yellow arrow. */
export const LogoArrowCue = forwardRef<HTMLDivElement>(function LogoArrowCue(
  _,
  ref,
) {
  const startScale = 1 / ABOUT_INTRO.cueLayoutScale;

  const onArriveEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName !== "scroll-cue-arrive") return;
    freezeArrive(event.currentTarget, true);
  };

  return (
    <div
      className="scroll-cue"
      role="img"
      aria-label="Scroll down"
      style={
        {
          "--cue-from": `${ABOUT_INTRO.cueArriveVh}vh`,
          "--cue-to": `${ABOUT_INTRO.cueRestY}vh`,
          "--cue-arrive-ms": `${ABOUT_INTRO.cueArriveMs}ms`,
        } as CSSProperties
      }
    >
      <div className="scroll-cue-arrive" onAnimationEnd={onArriveEnd}>
        <span className="scroll-cue-hover">
          <div
            ref={ref}
            className="scroll-cue-pose will-change-transform"
            style={{
              transform: `translate3d(0, 0, 0) scale(${startScale})`,
              transformOrigin: "50% 38%",
              transformStyle: "preserve-3d",
            }}
          >
            <svg
              className="scroll-cue-icon experiment-logo-arrow"
              viewBox="48 44 176 182"
              aria-hidden="true"
            >
              <g transform="rotate(180 136 135)">
                <path d={LOGO_ARROW_PATH} fill="#29ABE2" />
              </g>
            </svg>
          </div>
        </span>
      </div>
    </div>
  );
});
