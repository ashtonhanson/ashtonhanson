"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { TitleShine } from "@/components/TitleShine";
import {
  arriveAngle,
  arriveT,
  arriveZTransform,
  type ArriveKind,
} from "@/lib/brandingMotion";
import { HOME_CHAPTER } from "@/lib/homeMotion";
import { home } from "@/lib/content";
import {
  composeIdleTransform,
  createIdleHoverState,
  type IdleHoverState,
} from "@/lib/idleHover";
import { viewHeight, visualRectTop } from "@/lib/loadClear";
import {
  createMousePullState,
  stepMousePull,
  type MousePullState,
} from "@/lib/mousePull";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}

const WORK_LINKS = [
  { href: "/branding", label: "BRANDING" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
] as const;

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

  const lag = index * 0.07;
  const enterEnd = 0.4 + lag;
  const exitStart = 0.58 + lag;

  const enterY = index === 0 ? -56 : index === 1 ? 28 : 64;
  const exitY = index === 0 ? -48 : index === 1 ? -20 : 56;

  let y = 0;
  let focus = 1;

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

  const blur = index === 1 ? (1 - focus) * 7 : 0;
  const opacity = 0.35 + focus * 0.65;

  return { y, blur, opacity };
}

function WorkLinks({
  className = "",
  style,
  ...rest
}: {
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const links = WORK_LINKS.filter((link) => link.href !== pathname);

  return (
    <div className={className} style={style} {...rest}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-display text-[0.78rem] font-medium tracking-[0.2em] text-ink transition-opacity hover:opacity-55"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function paint(
  el: HTMLElement,
  opacity: number,
  blur: number,
  transform: string,
) {
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
  el.style.transformStyle = "preserve-3d";
  el.style.transform = transform;
  el.style.visibility = opacity < 0.02 ? "hidden" : "visible";
  el.style.pointerEvents = opacity > 0.65 ? "auto" : "none";
}

export function SeeMenuBlock({
  cinematic = false,
  overlap = false,
}: {
  cinematic?: boolean;
  /** Pull up under the previous sticky chapter so the last lockup can scale out. */
  overlap?: boolean;
}) {
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
    if (reduced || cinematic) {
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
  }, [reduced, cinematic]);

  useEffect(() => {
    if (!cinematic) return;

    let frame = 0;
    let lastNow = performance.now();
    const idleMap = new WeakMap<HTMLElement, IdleHoverState>();
    const pullMap = new WeakMap<HTMLElement, MousePullState>();

    const idleFor = (el: HTMLElement) => {
      let state = idleMap.get(el);
      if (!state) {
        state = createIdleHoverState();
        idleMap.set(el, state);
      }
      return state;
    };

    const pullFor = (el: HTMLElement) => {
      let state = pullMap.get(el);
      if (!state) {
        state = createMousePullState();
        pullMap.set(el, state);
      }
      return state;
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const root = sectionRef.current;
      if (!root) return;
      const viewH = viewHeight();
      const lockup =
        root.querySelector<HTMLElement>("[data-menu-lockup]") ?? root;
      const top = visualRectTop(lockup);
      const nodes = [
        ...root.querySelectorAll<HTMLElement>("[data-menu-arrive]"),
      ].sort(
        (a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0),
      );

      nodes.forEach((el, i) => {
        const kind = (el.dataset.kind || "title") as ArriveKind;
        const angle = arriveAngle(i + 4);
        const t = reduced ? 1 : arriveT(top, viewH, kind, i * 40);
        const pose = arriveZTransform(t, angle, kind);
        el.style.transformOrigin = pose.origin;
        const pull =
          pose.opacity > 0.04
            ? stepMousePull(
                pullFor(el),
                el,
                now,
                dt,
                kind === "title" ? "title" : "subtitle",
                t,
              )
            : undefined;
        paint(
          el,
          pose.opacity,
          pose.blur,
          composeIdleTransform(
            idleFor(el),
            pose.transform,
            now,
            dt,
            i + 4,
            t >= 0.985,
            1 - t,
            1,
            pull,
          ),
        );
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [cinematic, reduced]);

  const linksFocus =
    reduced || cinematic
      ? 1
      : easeInOut(clamp((progress - 0.32) / 0.2, 0, 1)) *
        (1 - easeInOut(clamp((progress - 0.72) / 0.22, 0, 1)));

  if (cinematic) {
    return (
      <section
        ref={sectionRef}
        className="relative z-[14] flex w-full flex-col items-center justify-center overflow-x-clip px-5 py-[clamp(6rem,20vh,12rem)] md:px-8 xl:px-12 2xl:px-16"
        style={{
          marginTop: overlap ? HOME_CHAPTER.overlapGallery : undefined,
          perspective: "1400px",
          perspectiveOrigin: "50% 42%",
          transformStyle: "preserve-3d",
        }}
        aria-label="See menu"
      >
        <div
          data-menu-lockup
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center text-center xl:max-w-4xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="relative flex w-full flex-col items-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {home.seeMenuLines.map((line, index) => (
              <div
                key={line}
                data-menu-arrive
                data-kind="title"
                data-index={index}
                className="will-change-transform"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  transformOrigin: "50% 50%",
                }}
              >
                <TitleShine
                  as="p"
                  className="font-display text-[clamp(1.6rem,5.5vw,3.15rem)] font-black uppercase leading-[0.95] tracking-[0.05em] xl:text-[clamp(2.25rem,3.4vw,4.25rem)]"
                >
                  {line}
                </TitleShine>
              </div>
            ))}
          </div>

          <WorkLinks
            data-menu-arrive
            data-kind="copy"
            data-index={home.seeMenuLines.length}
            className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 will-change-transform"
            style={{
              opacity: 0,
              visibility: "hidden",
              transformOrigin: "50% 50%",
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative z-[14] overflow-hidden border-t border-line px-5 pb-[clamp(10rem,32vh,18rem)] pt-[clamp(5rem,16vh,10rem)] md:px-8 xl:px-12 xl:pb-[clamp(12rem,30vh,22rem)] xl:pt-[clamp(6rem,15vh,12rem)] 2xl:px-16"
      style={overlap ? { marginTop: "calc(-100dvh - 12vh)" } : undefined}
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

        <WorkLinks
          className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 will-change-transform"
          style={{
            opacity: 0.25 + linksFocus * 0.75,
            transform: `translate3d(0, ${(1 - linksFocus) * 18}px, 0)`,
          }}
        />
      </div>
    </section>
  );
}
