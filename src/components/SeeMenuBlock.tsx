"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TitleShine } from "@/components/TitleShine";
import { home } from "@/lib/content";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}

type LineMotion = {
  y: number;
  blur: number;
  opacity: number;
};

/**
 * Staggered scroll choreography for SEE MENU / FOR OTHER / WORK.
 * Lines meet clear & aligned at center; FOR OTHER blurs on enter/exit.
 */
function lineMotion(progress: number, index: number, reduced: boolean): LineMotion {
  if (reduced) return { y: 0, blur: 0, opacity: 1 };

  // Slightly off-timed activation windows per line
  const lag = index * 0.07;
  const enterEnd = 0.4 + lag;
  const exitStart = 0.58 + lag;

  // Start offsets so they travel toward a shared center stack
  const enterY = index === 0 ? -56 : index === 1 ? 28 : 64;
  const exitY = index === 0 ? -48 : index === 1 ? -20 : 56;

  let y = 0;
  let focus = 1; // 1 = clear/centered, 0 = entering or exiting

  if (progress < enterEnd) {
    const t = easeInOut(clamp(progress / enterEnd, 0, 1));
    y = enterY * (1 - t);
    focus = t;
  } else if (progress > exitStart) {
    const t = easeInOut(clamp((progress - exitStart) / (1 - exitStart), 0, 1));
    y = exitY * t;
    focus = 1 - t;
  } else {
    y = 0;
    focus = 1;
  }

  // Only FOR OTHER (index 1) uses blur ↔ clear ↔ blur
  const blur = index === 1 ? (1 - focus) * 7 : 0;
  const opacity = 0.35 + focus * 0.65;

  return { y, blur, opacity };
}

export function SeeMenuBlock() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0.5);
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
      setProgress(0.5);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      // 0 = section entering from below, 0.5 = centered, 1 = leaving above
      const raw = (viewH * 0.55 - rect.top) / (viewH * 0.85 + rect.height * 0.35);
      setProgress(clamp(raw, 0, 1));
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

  const linksFocus = reduced
    ? 1
    : easeInOut(clamp((progress - 0.32) / 0.2, 0, 1)) *
      (1 - easeInOut(clamp((progress - 0.72) / 0.22, 0, 1)));

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line px-5 pb-[clamp(10rem,32vh,18rem)] pt-[clamp(5rem,16vh,10rem)] md:px-8 xl:px-12 xl:pb-[clamp(12rem,30vh,22rem)] xl:pt-[clamp(6rem,15vh,12rem)] 2xl:px-16"
    >
      <div className="relative mx-auto flex min-h-[clamp(10rem,28vh,16rem)] max-w-3xl flex-col items-center justify-center text-center xl:min-h-[clamp(12rem,26vh,20rem)] xl:max-w-4xl">
        <div className="relative flex w-full flex-col items-center">
          {home.seeMenuLines.map((line, index) => {
            const motion = lineMotion(progress, index, reduced);
            return (
              <div
                key={line}
                className="will-change-transform"
                style={{
                  transform: `translate3d(0, ${motion.y}px, 0)`,
                  filter:
                    motion.blur > 0.05 ? `blur(${motion.blur}px)` : undefined,
                  opacity: motion.opacity,
                }}
              >
                <TitleShine
                  as="p"
                  className="font-display text-[clamp(1.6rem,5.5vw,3.15rem)] font-black uppercase leading-[0.95] tracking-[0.05em] xl:text-[clamp(2.25rem,3.4vw,4.25rem)]"
                >
                  {line}
                </TitleShine>
              </div>
            );
          })}
        </div>

        <div
          className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 will-change-transform"
          style={{
            opacity: 0.25 + linksFocus * 0.75,
            transform: `translate3d(0, ${(1 - linksFocus) * 18}px, 0)`,
          }}
        >
          {[
            { href: "/branding", label: "BRANDING" },
            { href: "/ads", label: "ADS" },
            { href: "/logos", label: "LOGOS" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-[0.78rem] font-medium tracking-[0.2em] text-ink transition-opacity hover:opacity-55"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
