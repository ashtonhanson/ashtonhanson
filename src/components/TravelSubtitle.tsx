"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { MobileBreakText } from "@/components/MobileBreakText";
import {
  createIdleHoverState,
  composeIdleTransform,
} from "@/lib/idleHover";
import { createMousePullState, stepMousePull } from "@/lib/mousePull";

type TravelSubtitleProps = {
  children: string;
  /** @deprecated Horizontal travel removed — kept for call-site compatibility. */
  reverse?: boolean;
  as?: ElementType;
  className?: string;
};

/**
 * Section subtitle with the same vertical parallax / blur behavior as titles.
 * No horizontal side travel.
 */
export function TravelSubtitle({
  children,
  as: Tag = "h3",
  className = "",
}: TravelSubtitleProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    const idle = createIdleHoverState();
    const pull = createMousePullState();

    const paint = (
      y: number,
      blur: number,
      opacity: number,
      now: number,
      dt: number,
    ) => {
      if (!el) return;
      const transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      const travelT = Math.min(1, blur / 9);
      const pulled = reduced
        ? undefined
        : stepMousePull(pull, el, now, dt, "subtitle", 1 - travelT);
      el.style.transform = composeIdleTransform(
        idle,
        transform,
        now,
        dt,
        19,
        travelT < 0.08 && opacity > 0.9,
        travelT,
        1,
        pulled,
      );
      el.style.transformStyle = "preserve-3d";
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      el.style.opacity = String(opacity);
    };

    let frame = 0;
    let lastNow = performance.now();

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;

      if (reduced) {
        paint(0, 0, 1, now, dt);
        return;
      }

      const anchor = anchorRef.current;
      if (!anchor) return;

      const viewH = window.innerHeight || 1;
      const rect = anchor.getBoundingClientRect();
      const naturalCenter = rect.top + rect.height / 2;
      const idealY = viewH * 0.25;
      const pastIdeal = idealY - naturalCenter;
      const y = Math.max(-24, Math.min(132, pastIdeal * 0.55));

      const blurStart = 22;
      const blurRange = 70;
      const blurMax = 9;
      const blur =
        y <= blurStart
          ? 0
          : Math.min(blurMax, ((y - blurStart) / blurRange) * blurMax);
      const opacity = blur > 0.05 ? Math.max(0.42, 1 - blur / 14) : 1;
      paint(y, blur, opacity, now, dt);
    };

    if (el) el.style.willChange = "transform, filter, opacity";
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <span ref={anchorRef} className="relative inline-block">
      <Tag
        ref={ref}
        className={`inline-block w-max max-w-none text-center font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground xl:text-[clamp(1.35rem,1.55vw,1.7rem)] ${className}`.trim()}
      >
        <MobileBreakText text={children} />
      </Tag>
    </span>
  );
}
