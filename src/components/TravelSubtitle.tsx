"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { MobileBreakText } from "@/components/MobileBreakText";

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

    const apply = (y: number, blur: number, opacity: number) => {
      if (!el) return;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      el.style.filter = `blur(${blur.toFixed(2)}px)`;
      el.style.opacity = String(opacity);
    };

    if (reduced) {
      apply(0, 0, 1);
      return;
    }

    let frame = 0;
    let lastY = 0;
    let lastBlur = 0;

    const update = () => {
      frame = 0;
      const anchor = anchorRef.current;
      if (!anchor) return;

      const viewH = window.innerHeight || 1;
      const rect = anchor.getBoundingClientRect();
      const naturalCenter = rect.top + rect.height / 2;
      const idealY = viewH * 0.25;
      const pastIdeal = idealY - naturalCenter;
      const next = Math.max(-24, Math.min(132, pastIdeal * 0.55));

      const blurStart = 22;
      const blurRange = 70;
      const blurMax = 9;
      const nextBlur =
        next <= blurStart
          ? 0
          : Math.min(blurMax, ((next - blurStart) / blurRange) * blurMax);
      const nextOpacity =
        nextBlur > 0.05 ? Math.max(0.42, 1 - nextBlur / 14) : 1;

      if (
        Math.abs(next - lastY) < 0.15 &&
        Math.abs(nextBlur - lastBlur) < 0.05
      ) {
        return;
      }
      lastY = next;
      lastBlur = nextBlur;
      apply(next, nextBlur, nextOpacity);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    if (el) el.style.willChange = "transform, filter, opacity";
    apply(0, 0, 1);
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
    <span ref={anchorRef} className="relative inline-block">
      <Tag
        ref={ref}
        className={`inline-block w-max max-w-none text-center font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground ${className}`.trim()}
      >
        <MobileBreakText text={children} />
      </Tag>
    </span>
  );
}
