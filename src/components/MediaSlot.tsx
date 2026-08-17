"use client";

import { MediaCarousel } from "@/components/MediaCarousel";
import type { MediaItem } from "@/lib/content";

type MediaGridProps = {
  items: MediaItem[];
  label?: string;
};

/** @deprecated Prefer MediaCarousel — kept as an alias for the same gallery. */
export function MediaGrid({ items, label = "Work gallery" }: MediaGridProps) {
  return <MediaCarousel items={items} label={label} />;
}
