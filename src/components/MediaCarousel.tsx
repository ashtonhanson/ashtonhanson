"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MediaItem } from "@/lib/content";
import {
  defineAhMediaCarousel,
  type AhMediaCarousel,
} from "@/components/ah-media-carousel";

defineAhMediaCarousel();

type MediaCarouselProps = {
  items: MediaItem[];
  label?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ah-media-gallery-v32": React.DetailedHTMLProps<
        React.HTMLAttributes<AhMediaCarousel> & { label?: string },
        AhMediaCarousel
      >;
    }
  }
}

/** React bridge that mounts the native gallery web component. */
export function MediaCarousel({ items, label = "Gallery" }: MediaCarouselProps) {
  const galleryRef = useRef<AhMediaCarousel | null>(null);

  const bindGallery = useCallback(
    (node: AhMediaCarousel | null) => {
      galleryRef.current = node;
      if (node) node.items = items;
    },
    [items],
  );

  useEffect(() => {
    const el = galleryRef.current;
    if (el) el.items = items;
  }, [items]);

  if (!items.length) return null;

  return (
    <ah-media-gallery-v32 ref={bindGallery} label={label} className="block w-full" />
  );
}
