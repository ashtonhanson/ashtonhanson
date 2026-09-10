"use client";

import type { CSSProperties } from "react";

type CloudSpec = {
  src: string;
  top: string;
  width: string;
  dur: string;
  bob: string;
  /** 0–1 progress through the drift when the page loads. */
  start: number;
  opacity: number;
  dir: "ltr" | "rtl";
};

/** A few clouds from links/clouds/clouds.svg, staggered across the sky. */
const CLOUDS: CloudSpec[] = [
  {
    src: "/experiment/clouds/01.svg",
    top: "8vh",
    width: "18rem",
    dur: "88s",
    bob: "10s",
    start: 0.16,
    opacity: 0.95,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/03.svg",
    top: "28vh",
    width: "14rem",
    dur: "72s",
    bob: "9s",
    start: 0.38,
    opacity: 0.9,
    dir: "rtl",
  },
  {
    src: "/experiment/clouds/05.svg",
    top: "58vh",
    width: "16rem",
    dur: "96s",
    bob: "11s",
    start: 0.58,
    opacity: 0.92,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/07.svg",
    top: "76vh",
    width: "12rem",
    dur: "80s",
    bob: "8s",
    start: 0.78,
    opacity: 0.88,
    dir: "rtl",
  },
];

function delayFor(dur: string, start: number) {
  const seconds = Number.parseFloat(dur);
  if (!Number.isFinite(seconds)) return "0s";
  return `${(-(seconds * start)).toFixed(2)}s`;
}

export function SkyClouds() {
  return (
    <div className="sky-clouds" aria-hidden="true">
      {CLOUDS.map((cloud) => {
        const driftName =
          cloud.dir === "rtl" ? "sky-cloud-rtl" : "sky-cloud-ltr";
        const delay = delayFor(cloud.dur, cloud.start);
        return (
          <span
            key={cloud.src}
            className={`sky-cloud is-${cloud.dir}`}
            style={
              {
                top: cloud.top,
                width: cloud.width,
                "--cloud-opacity": String(cloud.opacity),
              } as CSSProperties
            }
          >
            <span
              className="sky-cloud-drift"
              style={{
                animation: `${driftName} ${cloud.dur} linear ${delay} infinite`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="sky-cloud-art"
                src={cloud.src}
                alt=""
                draggable={false}
                style={{
                  animation: `sky-cloud-bob ${cloud.bob} ease-in-out ${delay} infinite`,
                }}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
