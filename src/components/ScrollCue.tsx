"use client";

import { forwardRef, type CSSProperties } from "react";
import { ABOUT_INTRO } from "@/lib/cinematicDepth";

const ARROW_PATH =
  "M24 4c1.2 0 2.2 1 2.2 2.2v32.05l9.36-9.36a2.2 2.2 0 1 1 3.11 3.11L25.56 55.27a2.2 2.2 0 0 1-3.12 0L9.33 32a2.2 2.2 0 1 1 3.11-3.11l9.36 9.36V6.2C21.8 5 22.8 4 24 4Z";

/** Branded down-arrow shown on load before the first intro title. */
export const ScrollCue = forwardRef<HTMLDivElement>(function ScrollCue(
  _,
  ref,
) {
  const startScale = 1 / ABOUT_INTRO.cueLayoutScale;

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
      <div className="scroll-cue-arrive">
        <span className="scroll-cue-hover">
          <div
            ref={ref}
            className="scroll-cue-pose will-change-transform"
            style={{
              transform: `translate3d(0, 0, 0) scale(${startScale})`,
              transformOrigin: "50% 50%",
              transformStyle: "preserve-3d",
            }}
          >
            <svg
              className="scroll-cue-icon"
              viewBox="0 0 48 64"
              aria-hidden="true"
            >
              <path d={ARROW_PATH} fill="#E8DFC4" />
            </svg>
          </div>
        </span>
      </div>
    </div>
  );
});
