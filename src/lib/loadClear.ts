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
  const visualTop = window.visualViewport?.pageTop ?? 0;
  const y =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    visualTop ||
    0;
  return y > 1;
}

/** Layout viewport height — visualViewport is accurate in device emulation. */
export function viewHeight() {
  const visual = window.visualViewport?.height;
  if (visual && visual > 1) return visual;
  return window.innerHeight || 1;
}

/** Visible viewport width, including Chrome device-frame / pinch offsets. */
export function viewWidth() {
  const visual = window.visualViewport?.width;
  if (visual && visual > 1) return visual;
  return window.innerWidth || document.documentElement.clientWidth || 1;
}

export function viewLeft() {
  return window.visualViewport?.offsetLeft ?? 0;
}

export function viewTop() {
  return window.visualViewport?.offsetTop ?? 0;
}

/** getBoundingClientRect top, in visual-viewport coordinates. */
export function visualRectTop(el: HTMLElement) {
  return el.getBoundingClientRect().top - viewTop();
}

/**
 * 0 while the pin is still below the fold, 1 shortly after it sticks.
 * Bidirectional: scrolling back raises the pin and this falls, same path.
 */
export function chapterEnterProgress(pin: HTMLElement) {
  const viewH = viewHeight();
  const header = headerOffsetPx();
  const top = visualRectTop(pin);
  const start = viewH * 0.94;
  const end = header - viewH * 0.4;
  return Math.min(1, Math.max(0, (start - top) / Math.max(start - end, 1)));
}

/**
 * 0 when the pin meets the header, 1 when it unsticks from the visible stage.
 * Uses the visual viewport so Android Chrome / device-frame insets stay in sync.
 */
export function pinProgress(pin: HTMLElement) {
  const header = headerOffsetPx();
  const stageH = Math.max(viewHeight() - header, 120);
  const range = pin.offsetHeight - stageH;
  if (range < 64) return 0;
  const pinnedTop = viewTop() + header;
  return Math.min(
    1,
    Math.max(0, (pinnedTop - pin.getBoundingClientRect().top) / range),
  );
}

const STICKY_TOP_REM = 3.6;

export function headerOffsetPx() {
  const header = document.querySelector("header");
  if (header) return header.getBoundingClientRect().height;
  const root =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return STICKY_TOP_REM * root;
}

/**
 * Hold a lockup on screen for the life of its pin.
 * Chrome device frames often break position:sticky; fixed-while-pinned does not.
 */
export function applyPinStage(pin: HTMLElement, stage: HTMLElement | null) {
  if (!stage) return;
  const viewH = viewHeight();
  const viewW = viewWidth();
  const viewL = viewLeft();
  const viewT = viewTop();
  const header = headerOffsetPx();
  const stageH = Math.max(viewH - header, 120);
  const rect = pin.getBoundingClientRect();
  const pinnedTop = viewT + header;
  const pinnedBottom = pinnedTop + stageH;

  stage.style.height = `${stageH}px`;
  stage.style.width = `${viewW}px`;
  stage.style.maxWidth = `${viewW}px`;
  stage.style.right = "auto";
  stage.style.boxSizing = "border-box";

  if (rect.top > pinnedTop) {
    stage.style.position = "absolute";
    stage.style.left = `${viewL - rect.left}px`;
    stage.style.top = "0";
    stage.style.bottom = "auto";
    return;
  }

  if (rect.bottom > pinnedBottom) {
    stage.style.position = "fixed";
    stage.style.left = `${viewL}px`;
    stage.style.top = `${header}px`;
    stage.style.bottom = "auto";
    return;
  }

  stage.style.position = "absolute";
  stage.style.left = `${viewL - rect.left}px`;
  stage.style.top = "auto";
  stage.style.bottom = "0";
}
