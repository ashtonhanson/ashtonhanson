"use client";

import type { CSSProperties } from "react";

type Drift = "ltr" | "rtl" | "ltr-up" | "ltr-down" | "rtl-up" | "rtl-down";

type CloudSpec = {
  src: string;
  top: string;
  width: string;
  dur: string;
  bob: string;
  delay: string;
  opacity: number;
  dir: Drift;
};

/** Artwork from links/clouds/clouds.eps, drifting at mixed heights and speeds. */
const CLOUDS: CloudSpec[] = [
  { src: "/experiment/clouds/01.png", top: "7vh", width: "24rem", dur: "118s", bob: "9.2s", delay: "-42s", opacity: 0.96, dir: "ltr" },
  { src: "/experiment/clouds/02.png", top: "18vh", width: "19rem", dur: "86s", bob: "7.4s", delay: "-19s", opacity: 0.94, dir: "rtl-up" },
  { src: "/experiment/clouds/03.png", top: "4vh", width: "16.5rem", dur: "97s", bob: "8.1s", delay: "-61s", opacity: 0.92, dir: "ltr-down" },
  { src: "/experiment/clouds/04.png", top: "78vh", width: "20rem", dur: "104s", bob: "8.8s", delay: "-27s", opacity: 0.95, dir: "rtl" },
  { src: "/experiment/clouds/05.png", top: "46vh", width: "17rem", dur: "73s", bob: "6.6s", delay: "-8s", opacity: 0.9, dir: "ltr-up" },
  { src: "/experiment/clouds/06.png", top: "32vh", width: "15rem", dur: "64s", bob: "5.9s", delay: "-48s", opacity: 0.93, dir: "rtl-down" },
  { src: "/experiment/clouds/07.png", top: "62vh", width: "13.5rem", dur: "91s", bob: "7.1s", delay: "-14s", opacity: 0.88, dir: "ltr" },
  { src: "/experiment/clouds/08.png", top: "24vh", width: "11rem", dur: "54s", bob: "5.2s", delay: "-33s", opacity: 0.86, dir: "rtl" },
  { src: "/experiment/clouds/09.png", top: "54vh", width: "10rem", dur: "79s", bob: "6.8s", delay: "-55s", opacity: 0.84, dir: "ltr-down" },
  { src: "/experiment/clouds/10.png", top: "12vh", width: "8.5rem", dur: "49s", bob: "4.8s", delay: "-11s", opacity: 0.82, dir: "rtl-up" },
  { src: "/experiment/clouds/11.png", top: "70vh", width: "9rem", dur: "68s", bob: "5.6s", delay: "-22s", opacity: 0.85, dir: "ltr-up" },
  { src: "/experiment/clouds/12.png", top: "40vh", width: "7.5rem", dur: "58s", bob: "4.4s", delay: "-39s", opacity: 0.8, dir: "rtl" },
  { src: "/experiment/clouds/13.png", top: "86vh", width: "6.5rem", dur: "44s", bob: "4.1s", delay: "-6s", opacity: 0.78, dir: "ltr-down" },
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
              "--cloud-opacity": cloud.opacity,
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
