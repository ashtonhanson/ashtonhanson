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

/**
 * Cursor-follow shove is off — it fought layout on load and pushed
 * elements around. Idle hover still supplies the rest-state float.
 */
export function stepMousePull(
  state: MousePullState,
  _el?: HTMLElement,
  _now?: number,
  _dt?: number,
  _kind?: MousePullKind,
  _strength = 1,
) {
  state.x = 0;
  state.y = 0;
  state.z = 0;
  state.rotX = 0;
  state.rotY = 0;
  return state;
}
