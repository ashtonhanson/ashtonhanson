"use client";

import type { CSSProperties } from "react";

type CloudSpec = {
  top: string;
  width: string;
  dur: string;
  bob: string;
  delay: string;
  opacity: number;
  dir: "ltr" | "rtl";
  variant: 0 | 1 | 2;
};

/** Cartoon vector clouds at mixed heights, sizes, and slow left/right drifts. */
const CLOUDS: CloudSpec[] = [
  { top: "5vh", width: "21rem", dur: "94s", bob: "7.6s", delay: "-18s", opacity: 0.94, dir: "ltr", variant: 0 },
  { top: "13vh", width: "12rem", dur: "56s", bob: "5.4s", delay: "-33s", opacity: 0.8, dir: "rtl", variant: 1 },
  { top: "21vh", width: "17.5rem", dur: "78s", bob: "8.1s", delay: "-9s", opacity: 0.88, dir: "ltr", variant: 2 },
  { top: "30vh", width: "9rem", dur: "47s", bob: "6.2s", delay: "-24s", opacity: 0.72, dir: "rtl", variant: 0 },
  { top: "41vh", width: "25rem", dur: "112s", bob: "9.4s", delay: "-46s", opacity: 0.9, dir: "ltr", variant: 1 },
  { top: "52vh", width: "10.5rem", dur: "64s", bob: "5.1s", delay: "-12s", opacity: 0.76, dir: "rtl", variant: 2 },
  { top: "63vh", width: "15.5rem", dur: "86s", bob: "7.9s", delay: "-28s", opacity: 0.84, dir: "ltr", variant: 0 },
  { top: "72vh", width: "7.5rem", dur: "52s", bob: "4.7s", delay: "-15s", opacity: 0.68, dir: "rtl", variant: 1 },
  { top: "81vh", width: "19.5rem", dur: "101s", bob: "8.7s", delay: "-51s", opacity: 0.86, dir: "ltr", variant: 2 },
  { top: "88vh", width: "11.5rem", dur: "69s", bob: "6.5s", delay: "-7s", opacity: 0.74, dir: "rtl", variant: 0 },
];

/** Three-bump Mario-style clouds with a flat belly. */
const PATHS = [
  "M28 78c-14 0-22-12-14-24 4-22 32-28 44-12 8-20 40-24 52-4 16-8 40 4 36 22 14 2 16 18-2 18H28z",
  "M24 76c-12 2-20-12-12-22 6-20 34-22 44-8 12-18 40-16 48 2 16-6 34 6 30 18 12 2 14 16-2 16H24z",
  "M32 80c-16 0-22-14-12-26 8-20 36-22 46-6 10-16 36-18 46 2 14-4 30 8 26 18 12 2 12 14-4 14H32z",
];

export function SkyClouds() {
  return (
    <div className="sky-clouds" aria-hidden="true">
      {CLOUDS.map((cloud, index) => (
        <span
          key={index}
          className={`sky-cloud is-${cloud.dir}`}
          style={
            {
              top: cloud.top,
              width: cloud.width,
              "--cloud-dur": cloud.dur,
              "--cloud-bob": cloud.bob,
              "--cloud-delay": cloud.delay,
              "--cloud-opacity": cloud.opacity,
            } as CSSProperties
          }
        >
          <span className="sky-cloud-drift">
            <svg
              className="sky-cloud-art"
              viewBox="0 0 200 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={PATHS[cloud.variant]}
                fill="rgb(255 255 255 / 0.96)"
                stroke="rgb(168 214 232 / 0.85)"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}
