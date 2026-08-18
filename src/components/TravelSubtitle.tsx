"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type MutableRefObject,
} from "react";

export type TitleMotion = {
  followY: number;
  extraBlur: number;
  opacityScale: number;
};

type TravelSubtitleProps = {
  children: string;
  /** When true, pans right→left; when false, left→right. */
  reverse?: boolean;
  /** Shared motion from ParallaxBlock (vertical follow + blur/opacity). */
  motionRef?: MutableRefObject<TitleMotion>;
  /** Fallback vertical offset when motionRef is not provided. */
  followY?: number;
  extraBlur?: number;
  opacityScale?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Subtitle that pans horizontally with vertical scroll.
 * Writes transforms directly to the DOM to stay in sync with title parallax.
 */
export function TravelSubtitle({
  children,
  reverse = false,
  motionRef,
  followY = 0,
  extraBlur = 0,
  opacityScale = 1,
  as: Tag = "h3",
  className = "",
}: TravelSubtitleProps) {
  const ref = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef(0.5);
  const spanRef = useRef(88);
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
      spanRef.current = Math.min(120, Math.max(72, window.innerWidth * 0.11));
    };
    syncSpan();
    window.addEventListener("resize", syncSpan);
    return () => window.removeEventListener("resize", syncSpan);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const paint = (travel: number) => {
      const span = spanRef.current;
      const motion = motionRef?.current;
      const follow = motion?.followY ?? followY;
      const xBlur = motion?.extraBlur ?? extraBlur;
      const oScale = motion?.opacityScale ?? opacityScale;

      const progress = reduced ? 0.5 : reverse ? 1 - travel : travel;
      const slideX = -span + progress * span * 2;
      const edge = reduced ? 0 : Math.abs(progress - 0.5) * 2;
      const fade = edge * edge;
      const blur = (reduced ? 0 : fade * 9) + xBlur;
      const opacity = (reduced ? 1 : Math.max(0, 1 - fade * 1.05)) * oScale;

      el.style.transform = `translate3d(${slideX.toFixed(2)}px, ${follow.toFixed(2)}px, 0)`;
      el.style.filter = `blur(${blur.toFixed(2)}px)`;
      el.style.opacity = String(opacity);
    };

    if (reduced) {
      travelRef.current = 0.5;
      paint(0.5);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = markerRef.current;
      if (!marker) return;

      const viewH = window.innerHeight || 1;
      // Marker is untransformed — avoids measure/transform feedback.
      const rect = marker.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      const start = viewH * 1.35;
      const end = viewH * -0.45;
      const next = Math.max(0, Math.min(1, (start - y) / (start - end)));
      travelRef.current = next;
      // Always paint so shared title motion (followY / blur) stays current.
      paint(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    el.style.willChange = "transform, filter, opacity";
    paint(travelRef.current);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, reverse, motionRef, followY, extraBlur, opacityScale]);

  return (
    <span className="relative inline-block">
      <span
        ref={markerRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
        aria-hidden
      />
      <Tag
        ref={ref}
        data-travel-reverse={reverse ? "1" : "0"}
        className={`inline-block w-max max-w-none whitespace-pre-line text-center font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground ${className}`.trim()}
      >
        {children}
      </Tag>
    </span>
  );
}
