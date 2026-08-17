"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

type TravelSubtitleProps = {
  children: string;
  /** When true, pans right→left; when false, left→right. */
  reverse?: boolean;
  /** Extra vertical offset (px) — used to ride under a parallax title. */
  followY?: number;
  /** Extra blur (px) layered on top of the travel edge blur. */
  extraBlur?: number;
  /** Multiplier for opacity (e.g. when title fades). */
  opacityScale?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Subtitle that pans horizontally with vertical scroll.
 * Short path near page center; fade in/out close to mid; slow drift.
 * `reverse` flips direction so consecutive labels can alternate.
 */
export function TravelSubtitle({
  children,
  reverse = false,
  followY = 0,
  extraBlur = 0,
  opacityScale = 1,
  as: Tag = "h3",
  className = "",
}: TravelSubtitleProps) {
  const ref = useRef<HTMLElement>(null);
  const travelRef = useRef(0);
  const followYRef = useRef(followY);
  followYRef.current = followY;
  const [travel, setTravel] = useState(0);
  const [span, setSpan] = useState(88);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const syncSpan = () => {
      // Keep travel close to center — not the far edges of the screen
      setSpan(Math.min(120, Math.max(72, window.innerWidth * 0.11)));
    };
    syncSpan();
    window.addEventListener("resize", syncSpan);
    return () => window.removeEventListener("resize", syncSpan);
  }, []);

  useEffect(() => {
    if (reduced) {
      travelRef.current = 0.5;
      setTravel(0.5);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const viewH = window.innerHeight || 1;
      const rect = el.getBoundingClientRect();
      // Undo followY so progress stays tied to layout position.
      const y = rect.top + rect.height / 2 - followYRef.current;
      // Wide scroll window ⇒ slower horizontal drift per scroll amount
      const start = viewH * 1.35;
      const end = viewH * -0.45;
      const next = Math.max(0, Math.min(1, (start - y) / (start - end)));

      if (Math.abs(next - travelRef.current) < 0.002) return;
      travelRef.current = next;
      setTravel(next);
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

  // progress 0→1 ⇒ -span→+span (left→right). reverse ⇒ +span→-span.
  const progress = reduced ? 0.5 : reverse ? 1 - travel : travel;
  const slideX = -span + progress * span * 2;

  // Fade/blur near the ends of this short center path (not far off-screen)
  const edge = reduced ? 0 : Math.abs(progress - 0.5) * 2;
  const fade = edge * edge;
  const blur = (reduced ? 0 : fade * 9) + extraBlur;
  const opacity =
    (reduced ? 1 : Math.max(0, 1 - fade * 1.05)) * opacityScale;

  return (
    <Tag
      ref={ref}
      data-travel-reverse={reverse ? "1" : "0"}
      className={`inline-block w-max max-w-none whitespace-nowrap font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground ${className}`.trim()}
      style={{
        transform: `translate3d(${slideX.toFixed(2)}px, ${followY.toFixed(2)}px, 0)`,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity,
        willChange: reduced ? undefined : "transform, filter, opacity",
      }}
    >
      {children}
    </Tag>
  );
}
