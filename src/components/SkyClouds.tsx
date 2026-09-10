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

/** A few clean clouds from links/clouds/clouds.eps (no dark-blue outliers). */
const CLOUDS: CloudSpec[] = [
  {
    src: "/experiment/clouds/01.png",
    top: "10vh",
    width: "22rem",
    dur: "96s",
    bob: "11s",
    delay: "-28s",
    opacity: 0.94,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/02.png",
    top: "34vh",
    width: "16rem",
    dur: "78s",
    bob: "9s",
    delay: "-41s",
    opacity: 0.9,
    dir: "rtl",
  },
  {
    src: "/experiment/clouds/04.png",
    top: "62vh",
    width: "18rem",
    dur: "110s",
    bob: "12s",
    delay: "-17s",
    opacity: 0.92,
    dir: "ltr",
  },
  {
    src: "/experiment/clouds/07.png",
    top: "78vh",
    width: "12rem",
    dur: "84s",
    bob: "10s",
    delay: "-52s",
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
