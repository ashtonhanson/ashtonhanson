"use client";

import { forwardRef, useId } from "react";
import { ABOUT_INTRO } from "@/lib/cinematicDepth";

const SHAFT_PATH =
  "M21.8 6.2C21.8 5 22.8 4 24 4s2.2 1 2.2 2.2v32.05h-4.4z";
const HEAD_PATH =
  "M26.2 38.25l9.36-9.36a2.2 2.2 0 1 1 3.11 3.11L25.56 55.27a2.2 2.2 0 0 1-3.12 0L9.33 32a2.2 2.2 0 1 1 3.11-3.11l9.36 9.36z";

/** Metallic down-arrow shown on load before the first intro title. */
export const ScrollCue = forwardRef<HTMLDivElement>(function ScrollCue(
  _,
  ref,
) {
  const uid = useId().replace(/:/g, "");
  const shaftClip = `scroll-cue-shaft-${uid}`;
  const headClip = `scroll-cue-head-${uid}`;
  const gradId = `scroll-cue-grad-${uid}`;
  const startScale = 1 / ABOUT_INTRO.cueLayoutScale;

  return (
    <div className="scroll-cue" role="img" aria-label="Scroll down">
      <span className="scroll-cue-hover">
        <div
          ref={ref}
          className="scroll-cue-pose will-change-transform"
          style={{
            transform: `scale(${startScale})`,
            transformOrigin: "50% 12%",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            className="scroll-cue-icon"
            viewBox="0 0 48 64"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={shaftClip}>
                <path d={SHAFT_PATH} />
              </clipPath>
              <clipPath id={headClip}>
                <path d={HEAD_PATH} />
              </clipPath>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5c5c5a" />
                <stop offset="38%" stopColor="#5c5c5a" />
                <stop offset="47%" stopColor="#ffffff" />
                <stop offset="53%" stopColor="#ffffff" />
                <stop offset="62%" stopColor="#5c5c5a" />
                <stop offset="100%" stopColor="#5c5c5a" />
              </linearGradient>
            </defs>
            <g className="scroll-cue-shaft">
              <g clipPath={`url(#${shaftClip})`}>
                <rect
                  className="scroll-cue-shine"
                  x="-48"
                  y="-4"
                  width="144"
                  height="72"
                  fill={`url(#${gradId})`}
                />
              </g>
            </g>
            <g clipPath={`url(#${headClip})`}>
              <rect
                className="scroll-cue-shine"
                x="-48"
                y="-4"
                width="144"
                height="72"
                fill={`url(#${gradId})`}
              />
            </g>
          </svg>
        </div>
      </span>
    </div>
  );
});
