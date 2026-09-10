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
 * Logo plate: scroll travel plus a cursor glow. Glow only ticks while the
 * pointer is near — no perpetual rAF per plate (that locked /logos).
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
    if (reduced) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const glow = createLogoGlowState();
    let glowRaf = 0;
    let scrollRaf = 0;
    let visible = false;
    let hovering = false;
    let lastNow = performance.now();

    const paintTravel = () => {
      const el = poseRef.current;
      const art = artRef.current;
      const bezel = bezelRef.current;
      const anchor = ref.current;
      if (!el || !anchor) return;

      const viewH = window.innerHeight || 1;
      const box = anchor.getBoundingClientRect();
      const naturalCenter = box.top + box.height / 2;
      const start = viewH * 0.92;
      const end = viewH * 0.28;
      const progress = clamp((start - naturalCenter) / (start - end), 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      const travel = -eased * Math.min(220, viewH * 0.32);
      el.style.transform = travel
        ? `translate3d(0, ${travel.toFixed(2)}px, 0)`
        : "none";
      if (art) art.style.transform = "none";
      if (bezel) bezel.style.transform = "none";
    };

    const paintGlow = (now: number) => {
      const el = poseRef.current;
      if (!el) return;
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      const pointer = getPointer(now);
      const rect = el.getBoundingClientRect();
      const px = pointer.has
        ? (pointer.x - rect.left) / Math.max(rect.width, 1)
        : 0.5;
      const py = pointer.has
        ? (pointer.y - rect.top) / Math.max(rect.height, 1)
        : 0.5;
      const dist = Math.hypot(px - 0.5, py - 0.5);
      hovering = pointer.has && dist <= 0.72;
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

    const glowLoop = (now: number) => {
      if (!visible || document.hidden) {
        glowRaf = 0;
        return;
      }
      const stepped = (() => {
        paintGlow(now);
        return glow.hover;
      })();
      if (hovering || stepped > 0.02) {
        glowRaf = window.requestAnimationFrame(glowLoop);
      } else {
        glowRaf = 0;
      }
    };

    const kickGlow = () => {
      if (!visible || glowRaf) return;
      lastNow = performance.now();
      glowRaf = window.requestAnimationFrame(glowLoop);
    };

    const onScroll = () => {
      if (!visible || scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        paintTravel();
      });
    };

    const onPointerMove = () => {
      if (!visible) return;
      kickGlow();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible) {
          paintTravel();
          kickGlow();
        } else if (glowRaf) {
          window.cancelAnimationFrame(glowRaf);
          glowRaf = 0;
        }
      },
      { rootMargin: "20% 0px" },
    );
    const node = ref.current;
    if (node) io.observe(node);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(glowRaf);
      window.cancelAnimationFrame(scrollRaf);
    };
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
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
        <div ref={bezelRef} className="logo-plate-bezel" aria-hidden />
      </div>
    </figure>
  );
}
