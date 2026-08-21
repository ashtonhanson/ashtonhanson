export type LoadClearState = {
  blend: number;
};

/** Opening-title blur (px) before the first scroll. */
export const LOAD_CLEAR_BLUR_PX = 14;

export function createLoadClearState(): LoadClearState {
  return { blend: 1 };
}

/**
 * 1 = fully blurred at page top / load; 0 = clear.
 * Follows scroll both ways so returning to the top retraces the reveal.
 */
export function stepLoadClear(
  state: LoadClearState,
  dt: number,
  scrolled: boolean,
) {
  const target = scrolled ? 0 : 1;
  const tau = scrolled ? 150 : 180;
  const k = 1 - Math.exp(-dt / Math.max(tau, 1));
  state.blend += (target - state.blend) * k;
  if (state.blend < 0.002) state.blend = 0;
  if (state.blend > 0.998) state.blend = 1;
  return state.blend;
}

export function pageHasScrolled() {
  const y =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  return y > 1;
}
