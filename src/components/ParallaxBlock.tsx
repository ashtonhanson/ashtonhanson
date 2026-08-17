"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TitleShine } from "@/components/TitleShine";
import { TravelSubtitle } from "@/components/TravelSubtitle";

/**
 * Shared parallax title + copy stack used on every page section.
 *
 * Title sits above subtitle/body with reserved travel padding, then drifts
 * behind the copy on scroll. Once behind the subtext it gradually blurs.
 * Optional subtitle rides under the title on the same vertical parallax, while
 * panning horizontally (direction flipped via subtitleReverse).
 */
export function ParallaxBlock({
  title,
  subtitle,
  subtitleTravel = true,
  subtitleReverse = false,
  as = "h2",
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  /** Horizontal scroll travel. Off for short pages like Contact. */
  subtitleTravel?: boolean;
  /** Flip pan direction (right→left instead of left→right). */
  subtitleReverse?: boolean;
  as?: "h1" | "h2";
  children: ReactNode;
  className?: string;
}) {
  const titleRef = useRef<HTMLElement>(null);
  const offsetRef = useRef(0);
  const blurRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [blur, setBlur] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(mq.matches);
    syncReduced();
    mq.addEventListener("change", syncReduced);
    return () => mq.removeEventListener("change", syncReduced);
  }, []);

  useEffect(() => {
    if (reduced) {
      offsetRef.current = 0;
      blurRef.current = 0;
      setOffset(0);
      setBlur(0);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const titleEl = titleRef.current;
      if (!titleEl) return;

      const viewH = window.innerHeight || 1;
      const rect = titleEl.getBoundingClientRect();
      const naturalCenter = rect.top + rect.height / 2 - offsetRef.current;
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

      if (
        Math.abs(next - offsetRef.current) < 0.25 &&
        Math.abs(nextBlur - blurRef.current) < 0.08
      ) {
        return;
      }
      offsetRef.current = next;
      blurRef.current = nextBlur;
      setOffset(next);
      setBlur(nextBlur);
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

  const titleOpacity = blur > 0.05 ? Math.max(0.42, 1 - blur / 14) : 1;
  const followY = offset + (subtitle ? 10 : 0);

  return (
    <div className={`relative mx-auto max-w-3xl text-center ${className}`}>
      <div
        className={`relative z-0 flex justify-center ${
          subtitle && !subtitleTravel
            ? "items-center pb-[clamp(1.75rem,4vh,2.75rem)] pt-[clamp(0.5rem,1.5vh,1rem)]"
            : subtitle
              ? "min-h-[clamp(6.5rem,20vh,11rem)] items-end pb-[clamp(3.5rem,9vh,5.25rem)] pt-[clamp(0.25rem,1.5vh,1rem)]"
              : "min-h-[clamp(4.75rem,17vh,9rem)] items-end pb-[clamp(2.25rem,6.5vh,3.75rem)] pt-[clamp(0.25rem,1.5vh,1rem)]"
        }`}
      >
        <div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 flex-col items-center overflow-x-clip px-5">
          <TitleShine
            as={as}
            ref={titleRef}
            className="pointer-events-none select-none text-center font-display text-[clamp(2.6rem,10.5vw,6rem)] font-black uppercase leading-[0.9] tracking-[0.04em]"
            style={{
              transform: reduced ? undefined : `translate3d(0, ${offset}px, 0)`,
              filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
              opacity: blur > 0.05 ? titleOpacity : undefined,
              willChange: reduced ? undefined : "transform, filter, opacity",
              transition: "filter 120ms linear, opacity 120ms linear",
            }}
          >
            {title}
          </TitleShine>

          {subtitle ? (
            subtitleTravel ? (
              <div className="absolute left-1/2 top-[calc(100%+0.35rem)] -translate-x-1/2">
                <TravelSubtitle
                  reverse={subtitleReverse}
                  followY={followY}
                  extraBlur={blur * 0.85}
                  opacityScale={titleOpacity}
                  className="pointer-events-none select-none"
                >
                  {subtitle}
                </TravelSubtitle>
              </div>
            ) : (
              <h3
                className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] w-max max-w-none -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(1.25rem,2.45vw,1.45rem)] font-medium uppercase leading-tight tracking-[0.18em] text-foreground"
                style={{
                  transform: `translate3d(0, ${followY.toFixed(2)}px, 0)`,
                }}
              >
                {subtitle}
              </h3>
            )
          ) : null}
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
