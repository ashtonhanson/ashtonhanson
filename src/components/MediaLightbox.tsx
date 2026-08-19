"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export type LightboxMedia = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

type MediaLightboxProps = {
  item: LightboxMedia | null;
  onClose: () => void;
};

function isVideo(item: LightboxMedia) {
  return item.type === "video" || /\.(mp4|webm|mov)$/i.test(item.src);
}

/** Full-viewport framed media viewer with dimmed, blurred page behind it. */
export function MediaLightbox({ item, onClose }: MediaLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!item) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  const video = isVideo(item);

  return createPortal(
    <div
      className="media-lightbox fixed inset-0 z-[80] flex items-center justify-center p-5 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="media-lightbox-backdrop absolute inset-0 cursor-default border-0 bg-black/65 backdrop-blur-md"
        aria-label="Close media viewer"
        onClick={onClose}
      />

      <div className="media-lightbox-frame relative z-10 w-full max-w-5xl outline-none xl:max-w-6xl 2xl:max-w-7xl">
        <p id={titleId} className="sr-only">
          {item.alt}
        </p>
        <button
          ref={closeRef}
          type="button"
          className="absolute -top-10 right-0 font-display text-[0.65rem] tracking-[0.18em] text-ink/70 uppercase transition-colors hover:text-ink md:-top-11"
          onClick={onClose}
        >
          Close
        </button>
        <div
          className="overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[0_0_40px_rgb(0_0_0_/_0.55)]"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {video ? (
            <video
              className="block max-h-[min(78vh,52rem)] w-full bg-black object-contain"
              src={item.src}
              controls
              autoPlay
              playsInline
              aria-label={item.alt}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.src}
              alt={item.alt}
              className="block max-h-[min(78vh,52rem)] w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
