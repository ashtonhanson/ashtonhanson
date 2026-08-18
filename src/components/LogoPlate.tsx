"use client";

import { useEffect, useRef, useState } from "react";

type LogoPlateProps = {
  src: string;
  alt: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Logo mockup plate with rounded shine edge. Scrolls upward over the
 * body copy above it (higher z-index + vertical parallax travel).
 */
export function LogoPlate({ src, alt }: LogoPlateProps) {
  const ref = useRef<HTMLElement>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      offsetRef.current = 0;
      setOffset(0);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const viewH = window.innerHeight || 1;
      const rect = el.getBoundingClientRect();
      // Undo current transform so measurement stays stable
      const naturalTop = rect.top - offsetRef.current;
      const naturalCenter = naturalTop + rect.height / 2;

      // Travel starts as the plate rises through the lower/mid viewport
      // and peaks so it can cover the body copy above.
      const start = viewH * 0.92;
      const end = viewH * 0.28;
      const progress = clamp((start - naturalCenter) / (start - end), 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      const travel = -eased * Math.min(220, viewH * 0.32);

      if (Math.abs(travel - offsetRef.current) < 0.3) return;
      offsetRef.current = travel;
      setOffset(travel);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <figure
      ref={ref}
      className="logo-plate relative z-20 mx-auto mt-10 w-full max-w-[min(100%,21rem)] md:max-w-[min(100%,24rem)]"
      style={{
        transform: reduced ? undefined : `translate3d(0, ${offset.toFixed(2)}px, 0)`,
        willChange: reduced ? undefined : "transform",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="logo-plate-image block h-auto w-full select-none"
        draggable={false}
      />
    </figure>
  );
}
