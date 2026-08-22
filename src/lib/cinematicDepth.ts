/**
 * Cinematic Z-scroll tuning knobs for the home page.
 * Adjust these to change how deep the void feels and how soft the gallery landing is.
 */
export const DEPTH = {
  /** CSS perspective on the scene (px). Lower = more dramatic foreshortening. */
  perspectivePx: 1400,
  /** Perspective origin Y — slightly high so depth reads toward center stage. */
  perspectiveOrigin: "50% 38%",

  /** translateZ when a panel is deep in the void (approaching). */
  voidZ: -380,
  /** Scale when deep in the void. */
  voidScale: 0.9,
  /** Soft blur (px) when deep in the void. */
  voidBlur: 3.5,

  /** translateZ when a panel has passed focus and recedes. */
  recedeZ: -260,
  /** Scale when fully receded. */
  recedeScale: 0.93,
  /** Soft blur (px) when receded. */
  recedeBlur: 2.5,

  /**
   * Soft-landing plateau around focus (progress units).
   * Larger = longer “rest” at the AI gallery before phase-2 recession.
   */
  restHalfWidth: 0.1,

  /** Viewport Y (0–1) where panels feel centered / at rest. */
  focusYRatio: 0.42,

  /** Mobile: dial back Z travel for readability + performance. */
  mobileVoidZ: -220,
  mobileRecedeZ: -140,
} as const;

/**
 * Sticky ABOUT intro chapter — progress windows are 0→1 through the pin.
 * Elements hand off one-by-one: previous blurs out as next blurs in.
 * Each element rides a distinct Z-forward path, then vanishes.
 * Units: x = vw, y = vh, z = px, scale = multiplier, rot = deg.
 */
export const ABOUT_INTRO = {
  /** Tall pin so Z-scale has real scroll room and never feels rushed. */
  pinHeightVh: "520vh",
  /** Fade with the last body line so ABOUT doesn’t sit empty before RECENT WORK. */
  stageFadeStart: 0.9,
  stageFadeEnd: 1,

  /** Blur (px) on enter/exit — hold stays sharp. */
  enterExitBlurPx: 10,
  /** Longer overlap so the previous line is already fading as the next arrives. */
  handoffRatio: 0.42,
  sequenceEnd: 0.94,

  /**
   * Opening down-arrow cue — short beat, then ABOUT/title takes the stage.
   * Units are 0→1 through the pin.
   */
  cueExitStart: 0.072,
  cueExitEnd: 0.168,
  /**
   * SVG is drawn this many times the on-screen rest size so scale() never
   * upsamples a tiny bitmap. Rest scale is 1 / cueLayoutScale.
   */
  cueLayoutScale: 6.6,
  cuePeakScale: 1.38,
  cuePeakZ: 640,
  /** Start above the viewport so the load-in is a real descent. */
  cueArriveVh: -78,
  /** Rest above true center so the exit still has downward travel. */
  cueRestY: -22,
  cueArriveMs: 1700,

  /**
   * Zoom t when opacity begins falling. Keep this < 1 so nothing sits at max scale.
   */
  fadeZoomT: 0.72,

  peakScale: 2.8,
  peakZ: 260,
  bodyStartScale: 0.38,
  bodyPeakScale: 3.4,
  bodyStartZ: -90,
  bodyPeakZ: 160,

  /** Counter perspective lift during Z surge — keeps type visually centered. */
  zoomAnchorY: 4.5,
} as const;

export type PathPose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
  /** Pitch toward camera (deg). Omitted = 0. */
  rotX?: number;
};

export type BezierPath = {
  p0: PathPose;
  p1: PathPose;
  p2: PathPose;
  p3: PathPose;
};

export type IntroHandoff = {
  appearStart: number;
  appearEnd: number;
  /** ≈ next element’s appearStart */
  exitStart: number;
  exitEnd: number;
};

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function easeOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

export function easeInCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * x;
}

/** Smooth ease-in and ease-out for path sampling. */
export function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** C2-smoothstep: zero velocity at both ends, no kinks. */
export function smootherstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * Sequential handoff windows: each element exits as the next enters.
 * Index 0 = scroll cue (on stage at load), 1 = ABOUT/title, 2 = ME, 3… = body.
 */
export function introHandoffs(lineCount: number): IntroHandoff[] {
  const cue: IntroHandoff = {
    appearStart: 0,
    appearEnd: 0,
    exitStart: ABOUT_INTRO.cueExitStart,
    exitEnd: ABOUT_INTRO.cueExitEnd,
  };

  const n = 2 + Math.max(lineCount, 0);
  const start = cue.exitStart;
  const end = ABOUT_INTRO.sequenceEnd;
  const beat = (end - start) / n;
  const handoff = beat * ABOUT_INTRO.handoffRatio;

  const rest = Array.from({ length: n }, (_, i) => {
    const appearStart = start + i * beat;
    const appearEnd = appearStart + handoff;
    const exitStart = i === n - 1 ? end : start + (i + 1) * beat;
    const exitEnd = Math.min(i === n - 1 ? 1 : 0.98, exitStart + handoff);
    return { appearStart, appearEnd, exitStart, exitEnd };
  });

  return [cue, ...rest];
}

/**
 * Opacity + blur envelope for appear / hold / disappear.
 * visibility 0 = gone+blurred, 1 = sharp+opaque.
 */
export function handoffVisibility(
  progress: number,
  win: IntroHandoff,
  blurPx: number = ABOUT_INTRO.enterExitBlurPx,
) {
  let visibility = 0;

  if (progress < win.appearStart) {
    visibility = 0;
  } else if (win.appearEnd <= win.appearStart) {
    // Already on stage (scroll cue) — sharp until exit
    if (progress < win.exitStart) {
      visibility = 1;
    } else if (progress < win.exitEnd) {
      visibility =
        1 -
        easeInOutCubic(
          (progress - win.exitStart) /
            Math.max(win.exitEnd - win.exitStart, 0.0001),
        );
    } else {
      visibility = 0;
    }
  } else if (progress < win.appearEnd) {
    visibility = easeInOutCubic(
      (progress - win.appearStart) /
        Math.max(win.appearEnd - win.appearStart, 0.0001),
    );
  } else if (progress < win.exitStart) {
    visibility = 1;
  } else if (progress < win.exitEnd) {
    visibility =
      1 -
      easeInOutCubic(
        (progress - win.exitStart) /
          Math.max(win.exitEnd - win.exitStart, 0.0001),
      );
  }

  return {
    opacity: visibility,
    blur: (1 - visibility) * blurPx,
    zoomT: zoomProgress(progress, win),
  };
}

/**
 * Slow climb through the visible life. Fade starts at fadeZoomT so the
 * element is already dissolving before theoretical max scale — no peak park.
 */
function zoomProgress(progress: number, win: IntroHandoff) {
  const start = win.appearStart;
  const fadeAt = win.exitStart;
  const gone = win.exitEnd;
  const fadeZ = ABOUT_INTRO.fadeZoomT;

  if (progress <= start) return 0;
  if (progress >= gone) return 1;

  if (progress <= fadeAt) {
    const t = (progress - start) / Math.max(fadeAt - start, 0.0001);
    const shaped = win.appearEnd <= win.appearStart ? t : easeInOutCubic(t);
    return fadeZ * shaped;
  }

  const t = (progress - fadeAt) / Math.max(gone - fadeAt, 0.0001);
  return fadeZ + (1 - fadeZ) * t;
}

/**
 * ABOUT / ME — arrive small and deep, then surge toward camera like the original exit.
 */
export function aboutZoomPath(): BezierPath {
  const peakS = ABOUT_INTRO.peakScale;
  const peakZ = ABOUT_INTRO.peakZ;
  return {
    p0: { x: 0, y: 0, z: -160, scale: 0.26, rot: 0 },
    p1: { x: 0, y: 0, z: -18, scale: 0.88, rot: 0 },
    p2: { x: 0, y: 0, z: peakZ * 0.42, scale: 1 + (peakS - 1) * 0.42, rot: 0 },
    p3: { x: 0, y: 0, z: peakZ, scale: peakS, rot: 0 },
  };
}

/** Load cue — drawn large, starts scaled down so the surge stays sharp. */
export function cueZoomPath(): BezierPath {
  const s0 = 1 / ABOUT_INTRO.cueLayoutScale;
  const s3 = ABOUT_INTRO.cuePeakScale;
  const peakZ = ABOUT_INTRO.cuePeakZ;
  return {
    p0: { x: 0, y: 0, z: 0, scale: s0, rot: 0 },
    p1: { x: 0, y: 0, z: peakZ * 0.32, scale: s0 + (s3 - s0) * 0.32, rot: 0 },
    p2: { x: 0, y: 0, z: peakZ * 0.68, scale: s0 + (s3 - s0) * 0.68, rot: 0 },
    p3: { x: 0, y: 0, z: peakZ, scale: s3, rot: 0 },
  };
}

/**
 * Body lines — start clearly smaller, expand to a much larger peak than ABOUT.
 */
export function bodyZoomPath(): BezierPath {
  const s0 = ABOUT_INTRO.bodyStartScale;
  const s3 = ABOUT_INTRO.bodyPeakScale;
  const z0 = ABOUT_INTRO.bodyStartZ;
  const z3 = ABOUT_INTRO.bodyPeakZ;
  return {
    p0: { x: 0, y: 0, z: z0, scale: s0, rot: 0 },
    p1: { x: 0, y: 0, z: z0 * 0.55, scale: s0 + (s3 - s0) * 0.28, rot: 0 },
    p2: { x: 0, y: 0, z: z3 * 0.48, scale: s0 + (s3 - s0) * 0.62, rot: 0 },
    p3: { x: 0, y: 0, z: z3, scale: s3, rot: 0 },
  };
}

/**
 * Unique lateral path (X/Y/rot only). Z + scale come from aboutZoomPath().
 */
export function introElementPath(index: number): BezierPath {
  switch (index) {
    case 0: // ABOUT — rises, leans left, scales toward camera
      return {
        p0: { x: 0, y: 0, z: 0, scale: 1, rot: 0 },
        p1: { x: -2.5, y: -2, z: 0, scale: 1, rot: -3.2 },
        p2: { x: -6, y: -6, z: 0, scale: 1, rot: -8.5 },
        p3: { x: -10, y: -16, z: 0, scale: 1, rot: -14 },
      };
    case 1: // ME — rises, leans right, scales toward camera
      return {
        p0: { x: 0, y: 0, z: 0, scale: 1, rot: 0 },
        p1: { x: 3.5, y: -2, z: 0, scale: 1, rot: 3.8 },
        p2: { x: 9, y: -6, z: 0, scale: 1, rot: 10 },
        p3: { x: 15, y: -18, z: 0, scale: 1, rot: 16 },
      };
    case 2: // line 0 — from below-right
      return {
        p0: { x: 10, y: 10, z: 0, scale: 1, rot: 2 },
        p1: { x: 4, y: 4, z: 0, scale: 1, rot: 1 },
        p2: { x: -3, y: -2, z: 0, scale: 1, rot: -1 },
        p3: { x: -8, y: -22, z: 0, scale: 1, rot: -2 },
      };
    case 3: // line 1 — high arc from left
      return {
        p0: { x: -12, y: -8, z: 0, scale: 1, rot: 4 },
        p1: { x: -3, y: -2, z: 0, scale: 1, rot: 1 },
        p2: { x: 6, y: 3, z: 0, scale: 1, rot: -1.5 },
        p3: { x: 11, y: -22, z: 0, scale: 1, rot: -3 },
      };
    case 4: // line 2 — S-curve
      return {
        p0: { x: 8, y: 6, z: 0, scale: 1, rot: -2.5 },
        p1: { x: -6, y: -2, z: 0, scale: 1, rot: 1.5 },
        p2: { x: 5, y: -4, z: 0, scale: 1, rot: -1 },
        p3: { x: -8, y: -24, z: 0, scale: 1, rot: 2 },
      };
    default: {
      const sway = index % 2 === 0 ? 1 : -1;
      return {
        p0: { x: 10 * sway, y: 8 * sway, z: 0, scale: 1, rot: 3 * sway },
        p1: { x: -2 * sway, y: 2, z: 0, scale: 1, rot: -1 * sway },
        p2: { x: 4 * sway, y: -3, z: 0, scale: 1, rot: 1.2 * sway },
        p3: { x: -7 * sway, y: -24, z: 0, scale: 1, rot: -2 * sway },
      };
    }
  }
}

export function cueLifeT(progress: number, win: IntroHandoff) {
  return clamp(progress / Math.max(win.exitEnd, 0.0001), 0, 1);
}

/** vh: from above the screen to a high rest, no bounce. */
export function cueArriveY(elapsedMs: number) {
  const t = smootherstep(elapsedMs / ABOUT_INTRO.cueArriveMs);
  const start = ABOUT_INTRO.cueArriveVh;
  const rest = ABOUT_INTRO.cueRestY;
  return start + (rest - start) * t;
}

/** Tilt rides the same smoothed Z so the shaft never kicks. */
export function cueTiltAmount(scaleT: number) {
  return clamp(scaleT, 0, 1);
}

/** Stay solid while the mark drops, then fade with the exit. */
export function cueHoldOpacity(lifeT: number) {
  return 1 - smootherstep((lifeT - 0.6) / 0.4);
}

/**
 * Pose: cue uses a bigger Z-exit; ABOUT/ME arrive small then surge; body uses the small→huge zoom.
 * `lifeT` is 0→1 through the cue’s on-screen life (tilt recoil + drop).
 */
export function sampleIntroPose(
  index: number,
  zoomT: number,
  lifeT = zoomT,
): PathPose {
  if (index === 0) {
    const dropT = smootherstep(lifeT / 0.48);
    const scaleT = smootherstep((lifeT - 0.04) / 0.96);
    const zoom = sampleBezierPath(scaleT, cueZoomPath());
    const dropY = 8 * dropT + 26 * dropT * dropT;
    const exitY = -ABOUT_INTRO.cueRestY + 14;
    const y = dropY + (exitY - dropY) * scaleT;
    return {
      x: 0,
      y,
      z: zoom.z,
      scale: zoom.scale,
      rot: 0,
      rotX: 8 + 100 * cueTiltAmount(scaleT),
    };
  }
  const content = index - 1;
  const lateral = sampleBezierPath(zoomT, introElementPath(content));
  const zoom =
    content >= 2
      ? sampleBezierPath(zoomT, bodyZoomPath())
      : sampleBezierPath(zoomT, aboutZoomPath());
  return {
    x: lateral.x,
    y: lateral.y + ABOUT_INTRO.zoomAnchorY * zoomT,
    z: zoom.z,
    scale: zoom.scale,
    rot: lateral.rot,
  };
}

/** @deprecated Prefer introElementPath / sampleIntroPose. */
export function bodyLinePath(index: number): BezierPath {
  return introElementPath(index + 2);
}

/** Cubic bezier scalar. */
export function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/** Sample a 3D+scale+rotate bezier path at t ∈ [0,1]. */
export function sampleBezierPath(t: number, path: BezierPath): PathPose {
  const s = clamp(t, 0, 1);
  return {
    x: cubicBezier(s, path.p0.x, path.p1.x, path.p2.x, path.p3.x),
    y: cubicBezier(s, path.p0.y, path.p1.y, path.p2.y, path.p3.y),
    z: cubicBezier(s, path.p0.z, path.p1.z, path.p2.z, path.p3.z),
    scale: cubicBezier(s, path.p0.scale, path.p1.scale, path.p2.scale, path.p3.scale),
    rot: cubicBezier(s, path.p0.rot, path.p1.rot, path.p2.rot, path.p3.rot),
  };
}

/** Sample a path with smooth ease-in-out on t. */
export function sampleBezierPathEased(t: number, path: BezierPath): PathPose {
  return sampleBezierPath(easeInOutCubic(t), path);
}

export function poseToTransform(pose: PathPose) {
  const rotX = pose.rotX ?? 0;
  return `translate3d(${pose.x.toFixed(2)}vw, ${pose.y.toFixed(2)}vh, ${pose.z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateZ(${pose.rot.toFixed(2)}deg) scale(${pose.scale.toFixed(4)})`;
}

/** Fixed stage-light beam in viewport coordinates (for title shine). */
export const SPOTLIGHT = {
  /** Horizontal focus of the beam (vw). <50 = slightly left of center. */
  xVw: 38,
  /** Vertical focus of the beam (vh). Low = light from above. */
  yVh: 14,
  /** Ellipse radii of the soft beam. */
  radiusXVw: 72,
  radiusYVh: 52,
} as const;

/**
 * Flatten progress near the focus so Z-motion decelerates into a soft rest
 * (used for the AI gallery landing), then eases out again for phase 2.
 */
export function softPlateau(progress: number, center = 0.5, half = DEPTH.restHalfWidth) {
  const p = clamp(progress, 0, 1);
  const d = p - center;
  const flat = 0.22; // how much motion remains inside the plateau

  if (Math.abs(d) <= half) {
    return center + d * flat;
  }

  if (d > 0) {
    const outer = 1 - center - half;
    const t = clamp((d - half) / Math.max(outer, 0.0001), 0, 1);
    return center + half * flat + t * (1 - center - half * flat);
  }

  const outer = center - half;
  const t = clamp((-d - half) / Math.max(outer, 0.0001), 0, 1);
  return center - half * flat - t * (center - half * flat);
}

export type DepthPose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
  opacity: number;
  blur: number;
};

/**
 * Map 0→0.5→1 depth progress into a liquid multi-axis pose (bezier-sampled).
 * 0 = void (approaching camera), 0.5 = rest, 1 = receded into background.
 */
export function poseFromProgress(
  progress: number,
  opts?: { voidZ?: number; recedeZ?: number; sway?: number },
): DepthPose {
  const voidZ = opts?.voidZ ?? DEPTH.voidZ;
  const recedeZ = opts?.recedeZ ?? DEPTH.recedeZ;
  const sway = opts?.sway ?? 1;
  const p = softPlateau(progress);

  const approachPath: BezierPath = {
    p0: { x: -5 * sway, y: 10, z: voidZ, scale: DEPTH.voidScale, rot: -2.5 * sway },
    p1: { x: 3 * sway, y: 4, z: voidZ * 0.55, scale: DEPTH.voidScale + 0.04, rot: 1.5 * sway },
    p2: { x: -2 * sway, y: 1, z: voidZ * 0.18, scale: 0.98, rot: -0.8 * sway },
    p3: { x: 0, y: 0, z: 0, scale: 1, rot: 0 },
  };

  const recedePath: BezierPath = {
    p0: { x: 0, y: 0, z: 0, scale: 1, rot: 0 },
    p1: { x: 2 * sway, y: -2, z: recedeZ * 0.25, scale: 0.99, rot: 1 * sway },
    p2: { x: -4 * sway, y: -5, z: recedeZ * 0.65, scale: DEPTH.recedeScale + 0.02, rot: -2 * sway },
    p3: { x: 3 * sway, y: -8, z: recedeZ, scale: DEPTH.recedeScale, rot: 1.5 * sway },
  };

  if (p <= 0.5) {
    const t = easeOutCubic(p / 0.5);
    const pose = sampleBezierPath(t, approachPath);
    return {
      ...pose,
      opacity: 0.42 + 0.58 * t,
      blur: DEPTH.voidBlur * (1 - t),
    };
  }

  const t = easeInCubic((p - 0.5) / 0.5);
  const pose = sampleBezierPath(t, recedePath);
  return {
    ...pose,
    opacity: 1 - 0.38 * t,
    blur: DEPTH.recedeBlur * t,
  };
}

/**
 * Convert a panel's layout box into raw depth progress (pre-plateau).
 * About Me starts near focus; lower sections begin in the void.
 */
export function rawProgressForPanel(el: HTMLElement, viewH: number) {
  const rect = el.getBoundingClientRect();
  const center = rect.top + rect.height / 2;
  const focusY = viewH * DEPTH.focusYRatio;
  // Positive when panel is still below the focus line (in the void / approaching).
  const dist = (center - focusY) / Math.max(viewH, 1);
  return clamp(0.5 - dist * 0.95, 0, 1);
}
