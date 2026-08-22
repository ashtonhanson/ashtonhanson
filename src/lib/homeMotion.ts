import { clamp } from "@/lib/brandingMotion";

/** Sticky home chapters after ABOUT — enter, hold the full lockup, then FIFO exit. */
export const HOME_CHAPTER = {
  galleryPinVh: "280vh",
  /**
   * A sticky pin unsticks a full viewport before the next section’s top.
   * Pull the next chapter up by ~1dvh so it starts as the previous leaves,
   * without a blank pause — extra is small so arrivals aren’t rushed.
   */
  overlapAbout: "calc(-100dvh - 14vh)",
  /** Pull SEE MENU up so it starts as the previous lockup leaves. */
  overlapGallery: "calc(-28vh)",
  /** FIFO arrive for SEE MENU — each line gets its own window. */
  menuEnterStart: 0.03,
  menuItemSpan: 0.24,
  menuOverlap: 0.05,
  menuArrivePack: 0.92,
  enterStart: 0.03,
  itemSpan: 0.18,
  /** Next piece starts before the previous finishes arriving. */
  overlap: 0.05,
  /** Scroll room with the full visual at rest. */
  holdAfter: 0.22,
  exitSpan: 0.09,
  /** Pack the last exit against the end of the pin (no empty sticky tail). */
  packTo: 1,
} as const;

export type ChapterWindow = {
  start: number;
  end: number;
};

export function chapterWindows(itemCount: number) {
  const n = Math.max(itemCount, 1);
  const { enterStart, itemSpan, overlap, holdAfter, exitSpan, packTo } =
    HOME_CHAPTER;
  const step = Math.max(itemSpan - overlap, 0.04);

  let ins: ChapterWindow[] = Array.from({ length: n }, (_, i) => ({
    start: enterStart + i * step,
    end: enterStart + i * step + itemSpan,
  }));

  const lastInEnd = ins[n - 1]?.end ?? enterStart + itemSpan;
  const exitGate = lastInEnd + holdAfter;

  let outs: ChapterWindow[] = Array.from({ length: n }, (_, i) => ({
    start: exitGate + i * exitSpan,
    end: exitGate + i * exitSpan + exitSpan,
  }));

  const rawEnd = outs[n - 1]?.end ?? exitGate;
  const scale = packTo / Math.max(rawEnd, 0.0001);
  const scaleWin = (win: ChapterWindow): ChapterWindow => ({
    start: win.start * scale,
    end: win.end * scale,
  });

  ins = ins.map(scaleWin);
  outs = outs.map(scaleWin);

  return { ins, outs, exitGate: exitGate * scale };
}

/** 0 when the lockup is still below the fold, 1 when it’s settled on stage. */
export function menuProgress(lockupTop: number, viewH: number) {
  const start = viewH * 1.12;
  const end = viewH * 0.16;
  return clamp((start - lockupTop) / Math.max(start - end, 1), 0, 1);
}

/** One arrive window per line, packed before the hold. */
export function menuWindows(itemCount: number) {
  const n = Math.max(itemCount, 1);
  const { menuEnterStart, menuItemSpan, menuOverlap, menuArrivePack } =
    HOME_CHAPTER;
  const step = Math.max(menuItemSpan - menuOverlap, 0.06);
  const raw = Array.from({ length: n }, (_, i) => ({
    start: menuEnterStart + i * step,
    end: menuEnterStart + i * step + menuItemSpan,
  }));
  const lastEnd = raw[n - 1]?.end ?? menuEnterStart + menuItemSpan;
  const scale = menuArrivePack / Math.max(lastEnd, 0.0001);
  return raw.map((win) => ({
    start: win.start * scale,
    end: win.end * scale,
  }));
}

/** 0→1 through a window; progress falling retraces the same pose. */
export function windowT(progress: number, win: ChapterWindow) {
  return clamp(
    (progress - win.start) / Math.max(win.end - win.start, 0.0001),
    0,
    1,
  );
}
