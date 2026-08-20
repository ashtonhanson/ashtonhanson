"use client";

import { useEffect, useRef, useState } from "react";
import { withIdleHover } from "@/lib/idleHover";
import { createLogoGlowState, stepLogoGlow } from "@/lib/logoGlow";
import {
  createMousePullState,
  getPointer,
  stepMousePull,
} from "@/lib/mousePull";

type LogoPlateProps = {
  src: string;
  alt: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function readRadius(el: HTMLElement) {
  const raw = getComputedStyle(el).borderTopLeftRadius.split(" ")[0];
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 18;
}

/**
 * Logo plate: the card tilts with the cursor, and the photo parallaxes
 * a little inside the frame — scaled just enough that it never gaps.
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
    const pull = createMousePullState();
    const glow = createLogoGlowState();
    const look = { x: 0, y: 0 };
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
      if (reduced) {
        el.style.transform = base;
        if (art) art.style.transform = "none";
        if (bezel) bezel.style.transform = "none";
        return;
      }

      const pulled = stepMousePull(pull, el, now, dt, "media");
      const pointer = getPointer(now);
      const rect = el.getBoundingClientRect();
      const px = pointer.has
        ? (pointer.x - rect.left) / Math.max(rect.width, 1)
        : 0.5;
      const py = pointer.has
        ? (pointer.y - rect.top) / Math.max(rect.height, 1)
        : 0.5;
      const dx = px - 0.5;
      const dy = py - 0.5;
      const dist = Math.hypot(dx, dy);
      const influence = pointer.has
        ? dist <= 0.62
          ? 1
          : Math.max(0, 1 - (dist - 0.62) * 1.6)
        : 0;
      const follow = 1 - Math.exp(-dt / 55);
      look.x = lerp(look.x, dx * 2 * influence, follow);
      look.y = lerp(look.y, dy * 2 * influence, follow);
      const nx = clamp(look.x, -1.35, 1.35);
      const ny = clamp(look.y, -1.35, 1.35);

      el.style.transformStyle = "preserve-3d";
      el.style.transform = withIdleHover(base, {
        x: pulled.x,
        y: pulled.y,
        z: pulled.z,
        rot: 0,
        rotX: pulled.rotX,
        rotY: pulled.rotY,
      });

      if (art) {
        const w = art.offsetWidth || el.clientWidth || 1;
        const h = art.offsetHeight || el.clientHeight || 1;
        const tiltX = pulled.rotY / 11;
        const tiltY = -pulled.rotX / 9;
        const mixX = clamp(tiltX * 0.7 + nx * 0.45, -1, 1);
        const mixY = clamp(tiltY * 0.7 + ny * 0.45, -1, 1);
        const shiftX = -mixX * 13;
        const shiftY = -mixY * 10;
        const cover = Math.max(
          (2 * Math.abs(shiftX)) / w,
          (2 * Math.abs(shiftY)) / h,
        );
        art.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0) scale(${(1 + cover).toFixed(4)})`;
      }

      if (bezel) {
        bezel.style.transform = "none";
      }

      const plateW = el.clientWidth;
      const plateH = el.clientHeight;
      if (plateW < 8 || plateH < 8) return;

      const stepped = stepLogoGlow(glow, now, dt, {
        plateW,
        plateH,
        radius: readRadius(imageRef.current ?? el),
        pointerX: px,
        pointerY: py,
        hovering: influence > 0.18,
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
