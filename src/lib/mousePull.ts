function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type MousePullState = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
};

export type MousePullKind = "title" | "subtitle" | "body" | "media" | "gallery";

const AMP: Record<MousePullKind, number> = {
  title: 1,
  subtitle: 0.84,
  body: 0.6,
  media: 0.96,
  gallery: 0.36,
};

type PointerSample = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  has: boolean;
  lastMove: number;
};

const pointer: PointerSample = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  has: false,
  lastMove: 0,
};

let listening = false;
let lastDecay = 0;
let coarse = false;

function onPointerMove(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  const now = event.timeStamp || performance.now();
  const dt = pointer.lastMove
    ? clamp(now - pointer.lastMove, 8, 48)
    : 16;
  if (pointer.lastMove) {
    const instX = ((event.clientX - pointer.x) * 1000) / dt;
    const instY = ((event.clientY - pointer.y) * 1000) / dt;
    pointer.vx = pointer.vx * 0.58 + instX * 0.42;
    pointer.vy = pointer.vy * 0.58 + instY * 0.42;
  }
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.has = true;
  pointer.lastMove = now;
}

function onPointerLeave() {
  pointer.has = false;
}

function onCoarseChange() {
  coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse) {
    pointer.has = false;
    pointer.vx = 0;
    pointer.vy = 0;
  }
}

function ensurePointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  onCoarseChange();
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  window
    .matchMedia("(pointer: coarse)")
    .addEventListener("change", onCoarseChange);
}

function samplePointer(now: number) {
  ensurePointer();
  if (lastDecay) {
    const dt = now - lastDecay;
    if (dt > 0 && now - pointer.lastMove > 28) {
      const decay = Math.exp(-dt / 90);
      pointer.vx *= decay;
      pointer.vy *= decay;
      if (Math.hypot(pointer.vx, pointer.vy) < 6) {
        pointer.vx = 0;
        pointer.vy = 0;
      }
    }
  }
  lastDecay = now;
  return pointer;
}

export function getPointer(now: number) {
  return samplePointer(now);
}

export function createMousePullState(): MousePullState {
  return { x: 0, y: 0, z: 0, rotX: 0, rotY: 0 };
}

export function mousePullIsResting(state: MousePullState) {
  return (
    state.x === 0 &&
    state.y === 0 &&
    state.z === 0 &&
    state.rotX === 0 &&
    state.rotY === 0
  );
}

function spring(
  state: MousePullState,
  key: keyof MousePullState,
  target: number,
  k: number,
  eps: number,
) {
  state[key] += (target - state[key]) * k;
  if (Math.abs(state[key]) < eps) state[key] = 0;
}

/**
 * 3D reaction: the face tilts toward the cursor, then yaws / pitches and
 * lifts in the pointer’s travel direction. Springs back when it leaves.
 */
export function stepMousePull(
  state: MousePullState,
  el: HTMLElement,
  now: number,
  dt: number,
  kind: MousePullKind,
  strength = 1,
) {
  if (coarse || strength <= 0) {
    state.x = 0;
    state.y = 0;
    state.z = 0;
    state.rotX = 0;
    state.rotY = 0;
    return state;
  }

  const p = samplePointer(now);
  const rect = el.getBoundingClientRect();
  const padX = Math.max(32, rect.width * 0.1);
  const padY = Math.max(24, rect.height * 0.14);
  const halfW = Math.max(rect.width * 0.5 + padX, 1);
  const halfH = Math.max(rect.height * 0.5 + padY, 1);
  const nx = p.has ? clamp((p.x - (rect.left + rect.width / 2)) / halfW, -1.6, 1.6) : 0;
  const ny = p.has ? clamp((p.y - (rect.top + rect.height / 2)) / halfH, -1.6, 1.6) : 0;
  const d = Math.hypot(nx, ny);
  const influence = p.has
    ? d <= 1
      ? 1 - d * 0.12
      : Math.max(0, 1 - (d - 1) * 1.7)
    : 0;

  const speed = Math.hypot(p.vx, p.vy);
  const live = speed > 16;
  const n = clamp(speed / 1080, 0, 1);
  const eased = n * n * (3 - 2 * n);
  const dirX = live ? p.vx / speed : 0;
  const dirY = live ? p.vy / speed : 0;
  const amp = AMP[kind] * strength;
  const mag = influence * eased;
  const hold = influence * influence;

  const targetX = (dirX * mag * 0.26 + nx * hold * 0.1) * amp;
  const targetY = (dirY * mag * 0.2 + ny * hold * 0.08) * amp;
  const targetZ = (hold * 22 + mag * 28) * amp;
  const targetRotY = (nx * hold * 10.5 + dirX * mag * 8.4) * amp;
  const targetRotX = (-ny * hold * 8.2 - dirY * mag * 6.6) * amp;

  const tau = mag > 0.04 || hold > 0.12 ? 68 : 170;
  const k = 1 - Math.exp(-dt / tau);
  spring(state, "x", targetX, k, 0.002);
  spring(state, "y", targetY, k, 0.002);
  spring(state, "z", targetZ, k, 0.15);
  spring(state, "rotX", targetRotX, k, 0.02);
  spring(state, "rotY", targetRotY, k, 0.02);
  return state;
}
