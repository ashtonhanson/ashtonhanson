"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MobileBreakText } from "@/components/MobileBreakText";
import { TitleShine } from "@/components/TitleShine";

/**
 * Shared parallax title + copy stack used on every page section.
 *
 * Title and subtitle share the same vertical parallax / blur behavior
 * (no horizontal travel). Motion is measured from a stable layout anchor.
 */
export function ParallaxBlock({
  title,
  subtitle,
  subtitleTravel: _subtitleTravel = true,
  subtitleReverse: _subtitleReverse = false,
  as = "h2",
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  /** @deprecated Horizontal travel removed — kept for call-site compatibility. */
  subtitleTravel?: boolean;
  /** @deprecated Horizontal travel removed — kept for call-site compatibility. */
  subtitleReverse?: boolean;
  as?: "h1" | "h2";
  children: ReactNode;
  className?: string;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(mq.matches);
    syncReduced();
    mq.addEventListener("change", syncReduced);
    return () => mq.removeEventListener("change", syncReduced);
  }, []);

  useEffect(() => {
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const hasSubtitle = Boolean(subtitle);

    const apply = (y: number, blur: number, opacity: number) => {
      if (titleEl) {
        titleEl.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        titleEl.style.filter = `blur(${blur.toFixed(2)}px)`;
        titleEl.style.opacity = String(opacity);
      }
      if (subtitleEl) {
        const followY = y + (hasSubtitle ? 10 : 0);
        subtitleEl.style.transform = `translate3d(0, ${followY.toFixed(2)}px, 0)`;
        subtitleEl.style.filter = `blur(${(blur * 0.85).toFixed(2)}px)`;
        subtitleEl.style.opacity = String(opacity);
      }
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

    apply(0, 0, 1);
    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, subtitle]);

  return (
    <div className={`relative mx-auto max-w-3xl text-center ${className}`}>
      <div
        className={`relative z-0 flex justify-center ${
          subtitle
            ? "min-h-[clamp(6.5rem,20vh,11rem)] items-end pb-[clamp(3.5rem,9vh,5.25rem)] pt-[clamp(0.25rem,1.5vh,1rem)]"
            : "min-h-[clamp(4.75rem,17vh,9rem)] items-end pb-[clamp(2.25rem,6.5vh,3.75rem)] pt-[clamp(0.25rem,1.5vh,1rem)]"
        }`}
      >
        <div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 flex-col items-center overflow-x-clip px-5">
          <div ref={anchorRef} className="relative">
            <TitleShine
              as={as}
              ref={titleRef}
              className="pointer-events-none select-none text-center font-display text-[clamp(2.6rem,10.5vw,6rem)] font-black uppercase leading-[0.9] tracking-[0.04em]"
              style={
                reduced
                  ? undefined
                  : { willChange: "transform, filter, opacity" }
              }
            >
              {title}
            </TitleShine>
          </div>

          {subtitle ? (
            <h3
              ref={subtitleRef}
              className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] w-max max-w-none -translate-x-1/2 select-none text-center font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground"
              style={
                reduced
                  ? undefined
                  : { willChange: "transform, filter, opacity" }
              }
            >
              <MobileBreakText text={subtitle} />
            </h3>
          ) : null}
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
