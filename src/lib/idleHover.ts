function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type IdleHoverState = {
  blend: number;
  restSince: number | null;
  lastScrollY: number;
};

const DELAY_MS = 80;
const FADE_IN_MS = 260;
const FADE_OUT_TAU = 0.22;
const FADE_IN_TAU = 0.12;
const SCROLL_EPS = 0.4;

export function createIdleHoverState(): IdleHoverState {
  return { blend: 0, restSince: null, lastScrollY: Number.NaN };
}

/**
 * Rest = the page isn’t scrolling and the element is visible.
 * Used for document-flow titles (parallax). Cinematic scenes pass
 * authored rest into composeIdleTransform instead.
 */
export function stepIdleHover(
  state: IdleHoverState,
  visible: boolean,
  now: number,
  dt: number,
) {
  const y = window.scrollY;
  const scrolling =
    Number.isFinite(state.lastScrollY) &&
    Math.abs(y - state.lastScrollY) > SCROLL_EPS;
  state.lastScrollY = y;
  return stepIdleBlend(state, visible && !scrolling, now, dt);
}

/** Ease blend in after a still delay; ease out as soon as motion resumes. */
export function stepIdleBlend(
  state: IdleHoverState,
  atRest: boolean,
  now: number,
  dt: number,
) {
  if (atRest) {
    if (state.restSince == null) state.restSince = now;
    const elapsed = now - state.restSince;
    const target =
      elapsed <= DELAY_MS
        ? 0
        : clamp((elapsed - DELAY_MS) / FADE_IN_MS, 0, 1);
    const k = 1 - Math.exp(-dt / (FADE_IN_TAU * 1000));
    state.blend += (target - state.blend) * k;
  } else {
    state.restSince = null;
    const k = 1 - Math.exp(-dt / (FADE_OUT_TAU * 1000));
    state.blend += (0 - state.blend) * k;
  }

  if (state.blend < 0.002) state.blend = 0;
  if (state.blend > 0.998) state.blend = 1;
  return state.blend;
}

export type MotionOffset = {
  x: number;
  y: number;
  z: number;
  rot: number;
  rotX: number;
  rotY: number;
};

export function idleHoverOffset(
  blend: number,
  now: number,
  seed: number,
  amount = 1,
): MotionOffset {
  if (blend <= 0 || amount <= 0) {
    return { x: 0, y: 0, z: 0, rot: 0, rotX: 0, rotY: 0 };
  }
  const t = now * 0.001;
  const a = seed * 1.73;
  const y =
    Math.sin(t * 1.02 + a) * 0.42 + Math.sin(t * 0.41 + a * 1.8) * 0.14;
  const x = Math.sin(t * 0.68 + a + 1.1) * 0.16;
  const rot = Math.sin(t * 0.55 + a + 0.35) * 0.48;
  const rotX = Math.sin(t * 0.47 + a + 0.9) * 0.55;
  const rotY = Math.sin(t * 0.39 + a + 1.6) * 0.7;
  const z = (Math.sin(t * 0.58 + a) * 0.5 + 0.5) * 4.5;
  const m = blend * amount;
  return {
    x: x * m,
    y: y * m,
    z: z * m,
    rot: rot * m,
    rotX: rotX * m,
    rotY: rotY * m,
  };
}

export function withIdleHover(transform: string, hover: MotionOffset) {
  if (
    hover.x === 0 &&
    hover.y === 0 &&
    hover.z === 0 &&
    hover.rot === 0 &&
    hover.rotX === 0 &&
    hover.rotY === 0
  ) {
    return transform;
  }
  const idle = `perspective(920px) translate3d(${hover.x.toFixed(3)}vw, ${hover.y.toFixed(3)}vh, 0) rotateX(${hover.rotX.toFixed(3)}deg) rotateY(${hover.rotY.toFixed(3)}deg) rotateZ(${hover.rot.toFixed(3)}deg) translateZ(${hover.z.toFixed(1)}px)`;
  if (!transform || transform === "none") return idle;
  return `${idle} ${transform}`;
}

/**
 * Hover while at rest; while arriving/leaving, keep the same offset and
 * scale it by (1 - travelT) so it eases into shrink/scale instead of
 * dumping back to center first.
 */
export function composeIdleTransform(
  state: IdleHoverState,
  transform: string,
  now: number,
  dt: number,
  seed: number,
  atRest: boolean,
  travelT = 0,
  amount = 1,
  pull?: { x: number; y: number; z?: number; rotX?: number; rotY?: number },
) {
  const travel = clamp(travelT, 0, 1);
  const hold = atRest || (travel > 0.001 && travel < 0.999);
  const blend = stepIdleBlend(state, hold, now, dt);
  const hover = idleHoverOffset(blend, now, seed, (1 - travel) * amount);
  return withIdleHover(transform, {
    x: hover.x + (pull?.x ?? 0),
    y: hover.y + (pull?.y ?? 0),
    z: hover.z + (pull?.z ?? 0),
    rot: hover.rot,
    rotX: hover.rotX + (pull?.rotX ?? 0),
    rotY: hover.rotY + (pull?.rotY ?? 0),
  });
}
