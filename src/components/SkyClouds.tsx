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
  { src: "/experiment/clouds/01.png", top: "7vh", width: "24rem", dur: "290s", bob: "16s", delay: "-105s", opacity: 0.96, dir: "ltr" },
  { src: "/experiment/clouds/02.png", top: "18vh", width: "19rem", dur: "220s", bob: "14s", delay: "-48s", opacity: 0.94, dir: "rtl-up" },
  { src: "/experiment/clouds/03.png", top: "4vh", width: "16.5rem", dur: "248s", bob: "15s", delay: "-152s", opacity: 0.92, dir: "ltr-down" },
  { src: "/experiment/clouds/04.png", top: "78vh", width: "20rem", dur: "268s", bob: "16s", delay: "-68s", opacity: 0.95, dir: "rtl" },
  { src: "/experiment/clouds/05.png", top: "46vh", width: "17rem", dur: "188s", bob: "13s", delay: "-20s", opacity: 0.9, dir: "ltr-up" },
  { src: "/experiment/clouds/06.png", top: "32vh", width: "15rem", dur: "164s", bob: "12s", delay: "-120s", opacity: 0.93, dir: "rtl-down" },
  { src: "/experiment/clouds/07.png", top: "62vh", width: "13.5rem", dur: "232s", bob: "14s", delay: "-35s", opacity: 0.88, dir: "ltr" },
  { src: "/experiment/clouds/08.png", top: "24vh", width: "11rem", dur: "142s", bob: "11s", delay: "-82s", opacity: 0.86, dir: "rtl" },
  { src: "/experiment/clouds/09.png", top: "54vh", width: "10rem", dur: "200s", bob: "13s", delay: "-138s", opacity: 0.84, dir: "ltr-down" },
  { src: "/experiment/clouds/10.png", top: "12vh", width: "8.5rem", dur: "128s", bob: "10s", delay: "-28s", opacity: 0.82, dir: "rtl-up" },
  { src: "/experiment/clouds/11.png", top: "70vh", width: "9rem", dur: "176s", bob: "12s", delay: "-55s", opacity: 0.85, dir: "ltr-up" },
  { src: "/experiment/clouds/12.png", top: "40vh", width: "7.5rem", dur: "150s", bob: "10s", delay: "-98s", opacity: 0.8, dir: "rtl" },
  { src: "/experiment/clouds/13.png", top: "86vh", width: "6.5rem", dur: "116s", bob: "9s", delay: "-15s", opacity: 0.78, dir: "ltr-down" },
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
