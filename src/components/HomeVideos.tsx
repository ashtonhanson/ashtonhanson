"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaLightbox } from "@/components/MediaLightbox";
import {
  arriveAngle,
  arriveT,
  arriveTransform,
  type ArriveKind,
} from "@/lib/brandingMotion";
import { viewHeight, visualRectTop } from "@/lib/loadClear";
import type { MediaItem } from "@/lib/content";

function paintArrive(
  el: HTMLElement,
  opacity: number,
  blur: number,
  transform: string,
  flat: boolean,
) {
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = flat || blur < 0.05 ? "none" : `blur(${blur.toFixed(2)}px)`;
  el.style.transformStyle = flat ? "flat" : "preserve-3d";
  el.style.transform = transform;
  el.style.visibility = "visible";
  el.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
}

function HomeVideoThumb({
  item,
  onOpen,
}: {
  item: MediaItem;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const cropTop = item.cropTop ?? 0;
  const cropBottom = item.cropBottom ?? 0;
  const cropped = cropTop > 0 || cropBottom > 0;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const showFrame = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      try {
        video.currentTime = Math.min(0.8, video.duration * 0.06);
      } catch {
        /* some browsers block seek until ready */
      }
      video.pause();
    };

    video.addEventListener("loadedmetadata", showFrame);
    video.addEventListener("loadeddata", showFrame);
    if (video.readyState >= 1) showFrame();
    return () => {
      video.removeEventListener("loadedmetadata", showFrame);
      video.removeEventListener("loadeddata", showFrame);
    };
  }, [item.src]);

  return (
    <figure className="m-0 w-full">
      <figcaption className="mb-3 text-center font-display text-[clamp(0.92rem,2.1vw,1.2rem)] font-semibold uppercase tracking-[0.16em] text-foreground md:mb-4">
        {item.alt}
      </figcaption>
      <button
        type="button"
        className="group relative block w-full cursor-pointer border-0 bg-transparent p-0"
        onClick={onOpen}
        aria-label={`Play ${item.alt}`}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-[1.25rem] [clip-path:inset(0_round_1.25rem)]">
          <video
            ref={ref}
            className="pointer-events-none absolute w-full object-cover object-center"
            style={
              cropped
                ? {
                    top: `-${cropTop}%`,
                    left: 0,
                    height: `${100 + cropTop + cropBottom}%`,
                  }
                : { inset: 0, height: "100%" }
            }
            src={item.src}
            muted
            playsInline
            preload="metadata"
            controls={false}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgb(8_8_9_/_0.62)] text-white shadow-[0_0_24px_rgb(0_0_0_/_0.35)] transition-transform group-hover:scale-105 md:h-16 md:w-16"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 md:h-7 md:w-7" fill="currentColor">
              <path d="M8 5.14v13.72L19.5 12 8 5.14Z" />
            </svg>
          </span>
        </div>
      </button>
    </figure>
  );
}

export function HomeVideos({ items }: { items: MediaItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<MediaItem | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const android = /Android/i.test(navigator.userAgent);

    const tick = () => {
      const viewH = viewHeight();
      root.querySelectorAll<HTMLElement>("[data-arrive]").forEach((el) => {
        const kind = (el.dataset.kind || "media") as ArriveKind;
        const angle = arriveAngle(Number(el.dataset.angle || 0));
        const lag = Number(el.dataset.lag || 0);
        const t = arriveT(visualRectTop(el), viewH, kind, lag);
        const pose = arriveTransform(t, angle, kind);
        const atRest = t >= 0.985;
        const flatten = coarse || android || atRest;
        paintArrive(
          el,
          android ? (pose.opacity > 0.08 ? 1 : 0) : pose.opacity,
          flatten ? 0 : pose.blur,
          flatten ? "none" : pose.transform,
          flatten,
        );
      });
    };

    const loop = () => {
      frame = window.requestAnimationFrame(loop);
      if (!document.hidden) tick();
    };
    frame = window.requestAnimationFrame(loop);
    window.addEventListener("scroll", tick, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", tick);
    };
  }, []);

  if (!items.length) return null;

  return (
    <section
      ref={rootRef}
      aria-label="AI animation"
      className="relative z-[13] mx-auto w-full max-w-5xl px-5 py-[clamp(3rem,10vh,7rem)] md:px-8 xl:max-w-6xl xl:px-12 2xl:max-w-7xl"
      style={{ perspective: "1180px", perspectiveOrigin: "50% 40%" }}
    >
      <div className="flex flex-col gap-10 md:gap-14 xl:gap-16">
        {items.map((item, index) => (
          <div
            key={item.src}
            data-arrive
            data-kind="media"
            data-angle={String(2 + index)}
            data-lag={String(36 + index * 28)}
            className="w-full"
            style={{ opacity: 0, transformOrigin: "50% 40%" }}
          >
            <HomeVideoThumb item={item} onOpen={() => setOpen(item)} />
          </div>
        ))}
      </div>
      <MediaLightbox item={open} onClose={close} />
    </section>
  );
}
