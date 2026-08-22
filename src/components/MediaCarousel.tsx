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
      "ah-media-gallery-v19": React.DetailedHTMLProps<
        React.HTMLAttributes<AhMediaCarousel> & { label?: string },
        AhMediaCarousel
      >;
    }
  }
}

/** React bridge that mounts the native gallery web component + lightbox. */
export function MediaCarousel({ items, label = "Gallery" }: MediaCarouselProps) {
  const ref = useRef<AhMediaCarousel | null>(null);
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const apply = () => {
      if (cancelled || !ref.current) return;
      ref.current.items = items;
    };
    apply();
    void customElements.whenDefined("ah-media-gallery-v19").then(apply);
    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<GalleryOpenDetail>).detail;
      if (!detail?.src) return;
      setLightbox({
        src: detail.src,
        alt: detail.alt,
        type: detail.type,
      });
      el.pauseAutoplay();
    };

    el.addEventListener("ah-media-open", onOpen);
    return () => el.removeEventListener("ah-media-open", onOpen);
  }, [items]);

  const onClose = useCallback(() => {
    setLightbox(null);
    ref.current?.resumeAutoplay();
  }, []);

  if (!items.length) return null;

  return (
    <>
      <ah-media-gallery-v19 ref={ref} label={label} className="block w-full" />
      <MediaLightbox item={lightbox} onClose={onClose} />
    </>
  );
}
