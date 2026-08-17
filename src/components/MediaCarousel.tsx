"use client";

import { useEffect, useRef } from "react";
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
      "ah-media-gallery-v4": React.DetailedHTMLProps<
        React.HTMLAttributes<AhMediaCarousel> & { label?: string },
        AhMediaCarousel
      >;
    }
  }
}

/** React bridge that mounts the native gallery web component. */
export function MediaCarousel({ items, label = "Gallery" }: MediaCarouselProps) {
  const ref = useRef<AhMediaCarousel | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.items = items;
  }, [items]);

  if (!items.length) return null;

  return (
    <ah-media-gallery-v4 ref={ref} label={label} className="block w-full" />
  );
}
