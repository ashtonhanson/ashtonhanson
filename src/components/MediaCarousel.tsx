"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/content";
import {
  defineAhMediaCarousel,
  type AhMediaCarousel,
  type GalleryOpenDetail,
} from "@/components/ah-media-carousel";
import {
  MediaLightbox,
  type LightboxMedia,
} from "@/components/MediaLightbox";

defineAhMediaCarousel();

type MediaCarouselProps = {
  items: MediaItem[];
  label?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ah-media-gallery-v30": React.DetailedHTMLProps<
        React.HTMLAttributes<AhMediaCarousel> & { label?: string },
        AhMediaCarousel
      >;
    }
  }
}

/** React bridge that mounts the native gallery web component + lightbox. */
export function MediaCarousel({ items, label = "Gallery" }: MediaCarouselProps) {
  const galleryRef = useRef<AhMediaCarousel | null>(null);
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);

  const openLightbox = useCallback((detail: GalleryOpenDetail) => {
    if (!detail?.src) return;
    setLightbox({
      src: detail.src,
      alt: detail.alt,
      type: detail.type,
    });
    galleryRef.current?.pauseAutoplay();
  }, []);

  const onClose = useCallback(() => {
    setLightbox(null);
    galleryRef.current?.resumeAutoplay();
  }, []);

  const bindGallery = useCallback(
    (node: AhMediaCarousel | null) => {
      galleryRef.current = node;
      if (node) {
        node.onMediaOpen = openLightbox;
        node.items = items;
      }
    },
    [items, openLightbox],
  );

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    el.onMediaOpen = openLightbox;
    el.items = items;
  }, [items, openLightbox]);

  useEffect(() => {
    const onDocOpen = (event: Event) => {
      const detail = (event as CustomEvent<GalleryOpenDetail>).detail;
      openLightbox(detail);
    };
    document.addEventListener("ah-media-open", onDocOpen);
    return () => document.removeEventListener("ah-media-open", onDocOpen);
  }, [openLightbox]);

  if (!items.length) return null;

  return (
    <>
      <ah-media-gallery-v30 ref={bindGallery} label={label} className="block w-full" />
      <MediaLightbox item={lightbox} onClose={onClose} />
    </>
  );
}
