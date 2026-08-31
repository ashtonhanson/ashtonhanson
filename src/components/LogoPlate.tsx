"use client";

import { useEffect, useRef, useState } from "react";
import { createLogoGlowState, stepLogoGlow } from "@/lib/logoGlow";
import { getPointer } from "@/lib/mousePull";

type LogoPlateProps = {
  src: string;
  alt: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function readRadius(el: HTMLElement) {
  const raw = getComputedStyle(el).borderTopLeftRadius.split(" ")[0];
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 18;
}

/**
 * Logo plate: scroll travel plus a cursor glow. The photo stays put so
 * the frame never shoves on hover.
 */
export function LogoPlate({ src, alt }: LogoPlateProps) {
  const ref = useRef<HTMLElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const glow = createLogoGlowState();
    let frameId = 0;
    let lastNow = performance.now();

    const loop = (now: number) => {
      frameId = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;

      const el = poseRef.current;
      const art = artRef.current;
      const bezel = bezelRef.current;
      const anchor = ref.current;
      if (!el) return;

      let travel = 0;
      if (anchor && !reduced) {
        const viewH = window.innerHeight || 1;
        const box = anchor.getBoundingClientRect();
        const naturalCenter = box.top + box.height / 2;
        const start = viewH * 0.92;
        const end = viewH * 0.28;
        const progress = clamp((start - naturalCenter) / (start - end), 0, 1);
        const eased = progress * progress * (3 - 2 * progress);
        travel = -eased * Math.min(220, viewH * 0.32);
      }

      const base = travel
        ? `translate3d(0, ${travel.toFixed(2)}px, 0)`
        : "none";
      el.style.transform = base;
      if (art) art.style.transform = "none";
      if (bezel) bezel.style.transform = "none";
      if (reduced) return;

      const pointer = getPointer(now);
      const rect = el.getBoundingClientRect();
      const px = pointer.has
        ? (pointer.x - rect.left) / Math.max(rect.width, 1)
        : 0.5;
      const py = pointer.has
        ? (pointer.y - rect.top) / Math.max(rect.height, 1)
        : 0.5;
      const dist = Math.hypot(px - 0.5, py - 0.5);
      const hovering = pointer.has && dist <= 0.72;

      const plateW = el.clientWidth;
      const plateH = el.clientHeight;
      if (plateW < 8 || plateH < 8) return;

      const stepped = stepLogoGlow(glow, now, dt, {
        plateW,
        plateH,
        radius: readRadius(imageRef.current ?? el),
        pointerX: px,
        pointerY: py,
        hovering,
      });
      el.style.boxShadow = stepped.boxShadow;
    };

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, [reduced]);

  return (
    <figure
      ref={ref}
      className="logo-plate relative z-20 mx-auto mt-10 w-full max-w-[min(100%,21rem)] md:max-w-[min(100%,24rem)] xl:mt-12 xl:max-w-[min(100%,28rem)] 2xl:max-w-[min(100%,32rem)]"
      style={{ perspective: "920px" }}
    >
      <div
        ref={poseRef}
        className="logo-plate-pose will-change-transform"
        style={{ transformOrigin: "50% 50%", transformStyle: "preserve-3d" }}
      >
        <div className="logo-plate-window">
          <div ref={artRef} className="logo-plate-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              className="logo-plate-image block h-auto w-full select-none"
              draggable={false}
            />
          </div>
        </div>
        <div ref={bezelRef} className="logo-plate-bezel" aria-hidden />
      </div>
    </figure>
  );
}
