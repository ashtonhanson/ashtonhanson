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
      "ah-media-gallery-v28": React.DetailedHTMLProps<
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

  const handleOpen = useCallback((event: Event) => {
    const detail = (event as CustomEvent<GalleryOpenDetail>).detail;
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

  const setGalleryRef = useCallback(
    (node: AhMediaCarousel | null) => {
      if (galleryRef.current) {
        galleryRef.current.removeEventListener("ah-media-open", handleOpen);
      }
      galleryRef.current = node;
      if (node) {
        node.addEventListener("ah-media-open", handleOpen);
        node.items = items;
      }
    },
    [items, handleOpen],
  );

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.items = items;
    }
  }, [items]);

  if (!items.length) return null;

  return (
    <>
      <ah-media-gallery-v28 ref={setGalleryRef} label={label} className="block w-full" />
      <MediaLightbox item={lightbox} onClose={onClose} />
    </>
  );
}
