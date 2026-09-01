"use client";

import { LogoPlate } from "@/components/LogoPlate";
import { MediaCarousel } from "@/components/MediaCarousel";
import type { MediaItem } from "@/lib/content";

export function ArriveMedia({
  items,
  label,
  angle,
  lag = 36,
  variant = "carousel",
}: {
  items: MediaItem[];
  label: string;
  angle: number;
  lag?: number;
  variant?: "carousel" | "plate";
}) {
  const plate = variant === "plate" ? items[0] : null;
  return (
    <div
      data-arrive
      data-kind="media"
      data-angle={angle}
      data-lag={lag}
      className="pointer-events-auto mt-12 w-full max-w-5xl md:will-change-transform xl:mt-14 xl:max-w-6xl 2xl:max-w-7xl"
      style={{ opacity: 0, transformOrigin: "50% 40%" }}
    >
      {plate ? (
        <LogoPlate src={plate.src} alt={plate.alt} />
      ) : (
        <MediaCarousel items={items} label={label} />
      )}
    </div>
  );
}
