"use client";

import type { CSSProperties } from "react";

type CloudSpec = {
  src: string;
  top: string;
  width: string;
  dur: string;
  bob: string;
  delay: string;
  opacity: number;
  dir: "ltr" | "rtl";
};

/** A few clouds from links/clouds/clouds.svg, drifting with edge fades. */
const CLOUDS: CloudSpec[] = [
  {
    src: "/experiment/clouds/01.svg",
    top: "8vh",
    width: "18rem",
    dur: "88s",
    bob: "10s",
    delay: "-22s",
    opacity: 0.95,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/03.svg",
    top: "28vh",
    width: "14rem",
    dur: "72s",
    bob: "9s",
    delay: "-40s",
    opacity: 0.9,
    dir: "rtl",
  },
  {
    src: "/experiment/clouds/05.svg",
    top: "58vh",
    width: "16rem",
    dur: "96s",
    bob: "11s",
    delay: "-14s",
    opacity: 0.92,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/07.svg",
    top: "76vh",
    width: "12rem",
    dur: "80s",
    bob: "8s",
    delay: "-51s",
    opacity: 0.88,
    dir: "rtl",
  },
];

export function SkyClouds() {
  return (
    <div className="sky-clouds" aria-hidden="true">
      {CLOUDS.map((cloud) => (
        <span
          key={cloud.src}
          className={`sky-cloud is-${cloud.dir}`}
          style={
            {
              top: cloud.top,
              width: cloud.width,
              "--cloud-dur": cloud.dur,
              "--cloud-bob": cloud.bob,
              "--cloud-delay": cloud.delay,
              "--cloud-opacity": String(cloud.opacity),
            } as CSSProperties
          }
        >
          <span className="sky-cloud-drift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="sky-cloud-art"
              src={cloud.src}
              alt=""
              draggable={false}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
