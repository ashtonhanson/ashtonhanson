"use client";

import { forwardRef, useId } from "react";
import { ABOUT_INTRO } from "@/lib/cinematicDepth";

const ARROW_PATH =
  "M24 4c1.2 0 2.2 1 2.2 2.2v32.05l9.36-9.36a2.2 2.2 0 1 1 3.11 3.11L25.56 55.27a2.2 2.2 0 0 1-3.12 0L9.33 32a2.2 2.2 0 1 1 3.11-3.11l9.36 9.36V6.2C21.8 5 22.8 4 24 4Z";

/** Metallic down-arrow shown on load before the first intro title. */
export const ScrollCue = forwardRef<HTMLDivElement>(function ScrollCue(
  _,
  ref,
) {
  const uid = useId().replace(/:/g, "");
  const clipId = `scroll-cue-clip-${uid}`;
  const gradId = `scroll-cue-grad-${uid}`;
  const startScale = 1 / ABOUT_INTRO.cueLayoutScale;

  return (
    <div className="scroll-cue" role="img" aria-label="Scroll down">
      <span className="scroll-cue-hover">
        <div
          ref={ref}
          className="scroll-cue-pose will-change-transform"
          style={{
            transform: `translate3d(0, ${ABOUT_INTRO.cueArriveVh}vh, 0) scale(${startScale})`,
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            className="scroll-cue-icon"
            viewBox="0 0 48 64"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clipId}>
                <path d={ARROW_PATH} />
              </clipPath>
              <linearGradient
                id={gradId}
                x1="0"
                y1="0"
                x2="1"
                y2="0.28"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#7a7a78" />
                <stop offset="12%" stopColor="#c8c8c4" />
                <stop offset="24%" stopColor="#8e8e8c" />
                <stop offset="38%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#9a9a98" />
                <stop offset="62%" stopColor="#ececea" />
                <stop offset="74%" stopColor="#858583" />
                <stop offset="86%" stopColor="#f4f4f0" />
                <stop offset="100%" stopColor="#7a7a78" />
              </linearGradient>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <rect
                className="scroll-cue-shine"
                x="-96"
                y="-32"
                width="240"
                height="128"
                fill={`url(#${gradId})`}
              />
            </g>
          </svg>
        </div>
      </span>
    </div>
  );
});
