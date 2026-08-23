import {
  ABOUT_INTRO,
  aboutZoomPath,
  bodyZoomPath,
  introElementPath,
  introDirectionalLean,
  towardOppositeSide,
  sampleBezierPath,
  sampleIntroPose,
  type BezierPath,
  type PathPose,
} from "@/lib/cinematicDepth";

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function easeOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

export function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export type ArriveAngle = {
  x: number;
  y: number;
  rot: number;
};

/** Distinct entry directions so successive pieces don’t share a path. */
export const ARRIVE_ANGLES: readonly ArriveAngle[] = [
  { x: -18, y: 14, rot: -3.8 },
  { x: 20, y: -11, rot: 4.2 },
  { x: -13, y: -16, rot: 2.6 },
  { x: 16, y: 17, rot: -3.1 },
  { x: 9, y: 21, rot: 3.4 },
  { x: -22, y: 5, rot: -4.6 },
  { x: 24, y: -7, rot: 2.1 },
  { x: -9, y: 19, rot: 3.0 },
];

export function arriveAngle(index: number): ArriveAngle {
  return ARRIVE_ANGLES[index % ARRIVE_ANGLES.length]!;
}

/** Send body copy to the other side of the page from its title. */
export function oppositeArriveAngle(angle: ArriveAngle): ArriveAngle {
  return { x: -angle.x, y: angle.y, rot: -angle.rot };
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export type IntroTiming = {
  pinHeightVh: string;
  linesStart: number;
  lineSpan: number;
  holdAfter: number;
  exitSpan: number;
  overlapCases: string;
};

export type HandoffTiming = {
  lead: number;
  span: number;
  finish: number;
};

/** Subtle directional pitch/lean on titles and body copy — noticeable, not exaggerated. */
export const TEXT_DIRECTIONAL_LEAN = 1.42;

/** Branding page intro gets a touch more bias on top of the global lean. */
export const BRANDING_LEAN = 1.52;

export const BRANDING_INTRO: IntroTiming = {
  pinHeightVh: "520vh",
  /** BRANDING holds alone until here. */
  linesStart: 0.08,
  /** Each line’s shrink-in window. */
  lineSpan: 0.09,
  /** Rest after the last line has settled. */
  holdAfter: 0.08,
  /** Each segment’s shrink-out (small + blur + fade). */
  exitSpan: 0.075,
  /**
   * Slight pull so the first case starts as the intro leaves,
   * without scrolling past its title / subtitle / description.
   */
  overlapCases: "calc(-12vh)",
} as const;

/** CONTACT intro — still a cinematic pin, then the form lockup. */
export const CONTACT_INTRO = {
  ...BRANDING_INTRO,
  pinHeightVh: "320vh",
  linesStart: 0.03,
  lineSpan: 0.05,
  holdAfter: 0.02,
  exitSpan: 0.045,
  overlapCases: "calc(-100dvh - 140vh)",
} as const;

export const HUB_HANDOFF: HandoffTiming = {
  lead: 0.06,
  span: 0.36,
  finish: 0.96,
} as const;

export const CONTACT_HANDOFF = {
  lead: 0.08,
  span: 0.2,
  finish: 0.86,
} as const;

/**
 * Last-study sticky outro: scale toward camera and vanish, like ABOUT.
 * Fade starts before peak scale so nothing parks at max then pops out.
 */
export const PAGE_FINALE = {
  pinHeightVh: "280vh",
  hold: 0.16,
  itemSpan: 0.16,
  overlap: 0.055,
  packTo: 1,
  fadeZoomT: 0.7,
  peakScaleTitle: 2.45,
  peakScaleMedia: 2.15,
  peakScaleCopy: 2.12,
  peakZ: 220,
  blurPx: 12,
  stageFadeStart: 0.9,
  stageFadeEnd: 1,
} as const;

export type FinaleWindow = {
  start: number;
  end: number;
};

export function finaleWindows(itemCount: number) {
  const n = Math.max(itemCount, 1);
  const { hold, itemSpan, overlap, packTo } = PAGE_FINALE;
  const step = Math.max(itemSpan - overlap, 0.04);
  let outs: FinaleWindow[] = Array.from({ length: n }, (_, i) => ({
    start: hold + i * step,
    end: hold + i * step + itemSpan,
  }));
  const rawEnd = outs[n - 1]?.end ?? hold + itemSpan;
  const scale = packTo / Math.max(rawEnd, 0.0001);
  outs = outs.map((win) => ({
    start: win.start * scale,
    end: win.end * scale,
  }));
  return outs;
}

export function finaleExitT(progress: number, win: FinaleWindow) {
  return clamp(
    (progress - win.start) / Math.max(win.end - win.start, 0.0001),
    0,
    1,
  );
}

/** Scale-up + Z toward camera, fade before theoretical peak. */
export function finaleExitPose(
  exitT: number,
  angle: ArriveAngle,
  kind: ArriveKind,
  leanStrength = TEXT_DIRECTIONAL_LEAN,
) {
  const e = easeInOutCubic(clamp(exitT, 0, 1));
  const fadeAt = PAGE_FINALE.fadeZoomT;
  const vis =
    e < fadeAt
      ? 1
      : 1 - easeInOutCubic((e - fadeAt) / Math.max(1 - fadeAt, 0.0001));
  const zoom = e;
  const peak =
    kind === "title"
      ? PAGE_FINALE.peakScaleTitle
      : kind === "media"
        ? PAGE_FINALE.peakScaleMedia
        : PAGE_FINALE.peakScaleCopy;
  const scale = 1 + (peak - 1) * zoom;
  const z = PAGE_FINALE.peakZ * zoom;
  const u = 1 - vis;
  const lean = textLean(kind, leanStrength);
  const tilt = perspectiveTilt(angle, e, lean, "exit");
  return {
    opacity: vis,
    blur: PAGE_FINALE.blurPx * u,
    travelT: e,
    origin: "50% 50%",
    transform: `translate3d(${(angle.x * 0.1 * e).toFixed(2)}vw, ${(angle.y * 0.06 * e).toFixed(2)}vh, ${(z + tilt.depth).toFixed(1)}px) rotateY(${tilt.yaw.toFixed(2)}deg) rotateX(${tilt.pitch.toFixed(2)}deg) rotateZ(${(angle.rot * 0.22 * e + tilt.roll).toFixed(2)}deg) scale(${scale.toFixed(4)})`,
  };
}

export type ArriveKind = "title" | "copy" | "media";

function textLean(kind: ArriveKind, strength: number) {
  if (kind === "media") return 1;
  return kind === "title" ? strength * 1.08 : strength;
}

/** 3D tilt into the travel direction — separate from scale magnitude. */
function perspectiveTilt(
  angle: ArriveAngle,
  travel: number,
  lean: number,
  mode: "arrive" | "exit" = "arrive",
) {
  const dirX = angle.x >= 0 ? 1 : -1;
  const dirY = angle.y >= 0 ? 1 : -1;
  const pitchSign = mode === "exit" ? -1 : 1;
  const t = clamp(travel, 0, 1);
  return {
    pitch: pitchSign * dirY * (7.4 + Math.abs(angle.x) * 0.14) * t * lean,
    yaw: dirX * (6.2 + Math.abs(angle.y) * 0.11) * t * lean,
    roll: dirX * (8.6 + Math.abs(angle.rot) * 0.42) * t * lean,
    depth: t * 32 * lean * (mode === "exit" ? -1 : 1),
  };
}

/**
 * 0 = offstage (large + blurred), 1 = rest.
 * Bidirectional: scrolling back raises rectTop and t falls, retracing arrive.
 */
export function arriveT(
  rectTop: number,
  viewH: number,
  kind: ArriveKind,
  lagPx = 0,
) {
  const start = viewH * (kind === "copy" ? 0.94 : 0.96) + lagPx;
  const span = viewH * (kind === "copy" ? 0.28 : kind === "title" ? 0.38 : 0.34);
  return clamp((start - rectTop) / Math.max(span, 1), 0, 1);
}

/**
 * HUB TABLET enter tied to the branding intro pin — FIFO in, LIFO out
 * when intro progress runs backward. Packed so the last piece is at rest
 * before the pin ends, so reverse starts from a true hold.
 */
export function hubHandoffT(
  introProgress: number,
  packedExitGate: number,
  order: number,
  count: number,
  timing: { lead: number; span: number; finish: number } = HUB_HANDOFF,
) {
  const start0 = packedExitGate + timing.lead;
  const finish = timing.finish;
  const span = timing.span;
  const lastStart = Math.max(start0, finish - span);
  const n = Math.max(count, 1);
  const step = n > 1 ? (lastStart - start0) / (n - 1) : 0;
  const start = start0 + order * step;
  const raw = clamp(
    (introProgress - start) / Math.max(span, 0.0001),
    0,
    1,
  );
  return raw * raw * (3 - 2 * raw);
}

/** Same unique-angle arrive, but from small → rest instead of large → rest. */
export function arriveGrowTransform(
  t: number,
  angle: ArriveAngle,
  kind: ArriveKind,
  leanStrength = TEXT_DIRECTIONAL_LEAN,
) {
  const e = easeOutCubic(t);
  const u = 1 - e;
  const startScale = kind === "title" ? 0.28 : 0.36;
  const blur = (kind === "title" ? 16 : 11) * u;
  const lean = textLean(kind, leanStrength);
  const tilt = perspectiveTilt(angle, u, lean);
  return {
    opacity: e,
    blur,
    origin: "50% 50%",
    transform: `translate3d(${(angle.x * 0.7 * u).toFixed(2)}vw, ${(angle.y * 0.7 * u).toFixed(2)}vh, ${tilt.depth.toFixed(1)}px) rotateY(${tilt.yaw.toFixed(2)}deg) rotateX(${tilt.pitch.toFixed(2)}deg) rotateZ(${(angle.rot * u + tilt.roll).toFixed(2)}deg) scale(${(startScale + (1 - startScale) * e).toFixed(4)})`,
  };
}

export function arriveTransform(
  t: number,
  angle: ArriveAngle,
  kind: ArriveKind,
  leanStrength = TEXT_DIRECTIONAL_LEAN,
) {
  const u = 1 - easeOutCubic(t);
  const extra = kind === "title" ? 2.4 : kind === "media" ? 1.35 : 1.15;
  const scale = 1 + extra * u;
  const blur = (kind === "title" ? 20 : 14) * u;
  const lean = textLean(kind, leanStrength);
  const tilt = perspectiveTilt(angle, u, lean);
  return {
    opacity: easeOutCubic(t),
    blur,
    origin: `${angle.x >= 0 ? "82%" : "18%"} ${angle.y >= 0 ? "78%" : "22%"}`,
    transform: `translate3d(${(angle.x * u).toFixed(2)}vw, ${(angle.y * u).toFixed(2)}vh, ${tilt.depth.toFixed(1)}px) rotateY(${tilt.yaw.toFixed(2)}deg) rotateX(${tilt.pitch.toFixed(2)}deg) rotateZ(${(angle.rot * u + tilt.roll).toFixed(2)}deg) scale(${scale.toFixed(4)})`,
  };
}

/** Shrink + fade in the travel direction, leaning into the path. */
export function shrinkOutPose(
  exitT: number,
  angle: ArriveAngle,
  kind: ArriveKind = "copy",
  leanStrength = TEXT_DIRECTIONAL_LEAN,
) {
  const e = easeInOutCubic(clamp(exitT, 0, 1));
  const lean = textLean(kind, leanStrength);
  const tilt = perspectiveTilt(angle, e, lean, "exit");
  return {
    opacity: 1 - e,
    blur: 16 * e,
    travelT: e,
    origin: `${angle.x >= 0 ? "18%" : "82%"} ${angle.y >= 0 ? "22%" : "78%"}`,
    transform: `translate3d(${(angle.x * 0.58 * e).toFixed(2)}vw, ${(angle.y * 0.58 * e).toFixed(2)}vh, ${tilt.depth.toFixed(1)}px) rotateY(${tilt.yaw.toFixed(2)}deg) rotateX(${tilt.pitch.toFixed(2)}deg) rotateZ(${tilt.roll.toFixed(2)}deg) scale(${(1 - 0.84 * e).toFixed(4)})`,
  };
}

/** ADS / LOGOS intro copy — exits slightly lower on scroll-out. */
export function pageIntroBodyElementPath(): BezierPath {
  return {
    p0: { x: -8, y: 8, z: 0, scale: 1, rot: -2 },
    p1: { x: 0, y: 4, z: 0, scale: 1, rot: 0.6 },
    p2: { x: 5, y: 6, z: 0, scale: 1, rot: 1.8 },
    p3: { x: 9, y: 11, z: 0, scale: 1, rot: 3.2 },
  };
}

/** Intro paragraph pose for secondary pages (ADS, LOGOS). */
export function sampleIntroBodyPose(zoomT: number): PathPose {
  const lateralPath = towardOppositeSide(
    introElementPath(0),
    pageIntroBodyElementPath(),
  );
  const lateral = sampleBezierPath(zoomT, lateralPath);
  const zoom = sampleBezierPath(zoomT, aboutZoomPath());
  const lean = introDirectionalLean(lateralPath, zoomT, zoom.scale, 1);
  return {
    x: lateral.x,
    y: lateral.y + ABOUT_INTRO.zoomAnchorY * zoomT,
    z: zoom.z,
    scale: zoom.scale,
    rot: lateral.rot + lean.leanRot,
    rotX: lean.rotX,
    rotY: lean.rotY,
  };
}

/** Branding page intro — title arrives from the left, rests right, exits lower. */
export function brandingIntroElementPath(content: number): BezierPath {
  switch (content) {
    case 0:
      return {
        p0: { x: -12, y: 8, z: 0, scale: 1, rot: -5 },
        p1: { x: 2, y: 4, z: 0, scale: 1, rot: 1.8 },
        p2: { x: 10, y: 5, z: 0, scale: 1, rot: 4.2 },
        p3: { x: 16, y: 12, z: 0, scale: 1, rot: 6.8 },
      };
    case 1:
      return {
        p0: { x: -10, y: 10, z: 0, scale: 1, rot: -2.5 },
        p1: { x: 1, y: 5, z: 0, scale: 1, rot: 0.8 },
        p2: { x: 6, y: 7, z: 0, scale: 1, rot: 2.2 },
        p3: { x: 11, y: 15, z: 0, scale: 1, rot: 3.8 },
      };
    default:
      return introElementPath(content);
  }
}

/** Branding intro pin poses — cue unchanged; title/body use branding lateral paths. */
export function sampleBrandingIntroPose(
  index: number,
  zoomT: number,
  lifeT = zoomT,
): PathPose {
  if (index === 0) {
    return sampleIntroPose(0, zoomT, lifeT);
  }
  const content = index - 1;
  const titlePath = brandingIntroElementPath(0);
  const lateralPath =
    content >= 1
      ? towardOppositeSide(titlePath, brandingIntroElementPath(content))
      : brandingIntroElementPath(content);
  const lateral = sampleBezierPath(zoomT, lateralPath);
  const zoom =
    content >= 2
      ? sampleBezierPath(zoomT, bodyZoomPath())
      : sampleBezierPath(zoomT, aboutZoomPath());
  const lean = introDirectionalLean(lateralPath, zoomT, zoom.scale, content);
  return {
    x: lateral.x,
    y: lateral.y + ABOUT_INTRO.zoomAnchorY * zoomT,
    z: zoom.z,
    scale: zoom.scale,
    rot: lateral.rot + lean.leanRot,
    rotX: lean.rotX,
    rotY: lean.rotY,
  };
}
