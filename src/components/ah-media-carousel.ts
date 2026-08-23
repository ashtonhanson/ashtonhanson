import {
  createMousePullState,
  stepMousePull,
  type MousePullState,
} from "@/lib/mousePull";
import { withIdleHover } from "@/lib/idleHover";

export type CarouselMediaItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

export type GalleryOpenDetail = CarouselMediaItem & { index: number };

const SCALE_MIN = 0.9;
const SCALE_MAX = 1.08;
const OPACITY_MIN = 0.5;
const OPACITY_MAX = 1;
const BLUR_MAX = 3;
const AUTO_PX_PER_SEC = 46;
const USER_PAUSE_MS = 4200;
const FOCUS_GLIDE_MS = 2400;
/** Time constant for hover scroll pursuit — higher = softer glide. */
const HOVER_SCROLL_TAU_MS = 680;
const FOCUS_LERP_MS = 320;
const FOCUS_FALLOFF = 0.58;

const STYLES = /* css */ `
:host {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: clip;
  pointer-events: auto;
  color: #d2d2d2;
  font-family: var(--font-display, "Montserrat", system-ui, sans-serif);
}

* {
  box-sizing: border-box;
}

.wrap {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: clip;
}

.viewport {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgb(214 208 186 / 0.42);
  border-radius: 1.35rem;
  background: transparent;
}

/* Must stay flat — preserve-3d here makes overflow compute to visible,
   so scrollLeft is a no-op and crawl / hover / reset all fail. */
.track {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2rem 12%;
  scroll-behavior: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.track::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .viewport {
    background: transparent;
  }

  .track {
    gap: 1rem;
    padding: 2.5rem 18%;
    cursor: pointer;
    touch-action: pan-y;
  }

  .track.is-dragging {
    cursor: grabbing;
    user-select: none;
  }

  .track.is-dragging .slide,
  .track.is-dragging .media {
    cursor: grabbing;
  }
}

.slide {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: auto;
  max-width: 42rem;
  flex-shrink: 0;
  cursor: pointer;
  overflow: visible;
}

.slide-visual {
  transform-origin: 50% 50%;
  pointer-events: none;
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1.5px solid rgb(214 208 186 / 0.38);
  background: #080809;
  pointer-events: none;
}

:host(.is-stills) .frame {
  aspect-ratio: 1 / 1;
}

@media (min-width: 768px) {
  .slide {
    max-width: 42rem;
  }
}

@media (min-width: 1280px) {
  .track {
    padding: 2.75rem 14%;
  }

  .slide {
    max-width: 52rem;
  }
}

@media (min-width: 1536px) {
  .track {
    padding: 3rem 12%;
  }

  .slide {
    max-width: 58rem;
  }
}

.media {
  position: absolute;
  inset: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
  opacity: 1;
  pointer-events: none;
}

img.media {
  transform: scale(1.08);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.nav-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: #5f5f60;
  font: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 160ms ease, opacity 160ms ease;
}

.nav-btn:hover:not(:disabled) {
  color: #d2d2d2;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.dots {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  appearance: none;
  border: 0;
  padding: 0;
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 999px;
  background: #5f5f60;
  cursor: pointer;
  transition: width 300ms ease, background-color 300ms ease;
}

.dot:hover {
  background: #d2d2d2;
}

.dot[aria-selected="true"] {
  width: 1.25rem;
  background: rgb(232 223 196 / 0.72);
}
`;

const LIGHTBOX_STYLE_ID = "ah-media-lightbox-styles";

const LIGHTBOX_STYLES = /* css */ `
.ah-media-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 1.25rem;
}

.ah-media-lightbox__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(0 0 0 / 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: default;
}

.ah-media-lightbox__frame {
  position: relative;
  z-index: 1;
  width: fit-content;
  max-width: min(48rem, 86vw);
  outline: none;
}

.ah-media-lightbox__close {
  position: absolute;
  top: -0.55rem;
  right: -0.55rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgb(214 208 186 / 0.4);
  border-radius: 999px;
  background: rgb(8 8 9 / 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgb(232 223 196);
  font-family: var(--font-display, "Montserrat", system-ui, sans-serif);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 0 20px rgb(0 0 0 / 0.4);
  transition: opacity 160ms ease;
}

.ah-media-lightbox__close:hover {
  opacity: 0.82;
}

.ah-media-lightbox__media-wrap {
  overflow: hidden;
  border: 1px solid rgb(214 208 186 / 0.34);
  border-radius: 1.15rem;
  background: rgb(8 8 9 / 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 0 36px rgb(0 0 0 / 0.42),
    0 0 12px rgb(232 223 196 / 0.1);
}

.ah-media-lightbox__media {
  display: block;
  width: auto;
  max-width: min(48rem, 86vw);
  max-height: min(56vh, 34rem);
  object-fit: contain;
  background: transparent;
}

@media (min-width: 768px) {
  .ah-media-lightbox {
    padding: 2.25rem 1.75rem;
  }

  .ah-media-lightbox__frame {
    max-width: min(52rem, 78vw);
  }

  .ah-media-lightbox__media {
    max-width: min(52rem, 78vw);
    max-height: min(58vh, 36rem);
  }

  .ah-media-lightbox__close {
    top: -0.65rem;
    right: -0.65rem;
  }
}
`;

function ensureLightboxStyles() {
  if (typeof document === "undefined") return;
  let style = document.getElementById(LIGHTBOX_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = LIGHTBOX_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = LIGHTBOX_STYLES;
}

function isVideo(item: CarouselMediaItem) {
  return item.type === "video" || /\.(mp4|webm|mov)$/i.test(item.src);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

const ElementBase =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : (class {} as unknown as typeof HTMLElement);

const DRAG_THRESHOLD = 6;

/**
 * Native gallery: hover focus, slow auto-scroll, click-to-lightbox event.
 */
export class AhMediaCarousel extends ElementBase {
  static get observedAttributes() {
    return ["label"];
  }

  #items: CarouselMediaItem[] = [];
  #active = 0;
  #targetIndex = 0;
  #reduced = false;
  #scrollRaf: number | null = null;
  #scrollFrame: number | null = null;
  #autoRaf: number | null = null;
  #autoDir = 1;
  #autoPaused = false;
  #lightboxOpen = false;
  #userPaused = false;
  #userPauseTimer: number | null = null;
  #dragging = false;
  #dragMoved = false;
  #dragStartX = 0;
  #dragStartScroll = 0;
  #suppressClick = false;
  #pointerId = -1;
  #onMediaOpen: ((detail: GalleryOpenDetail) => void) | null = null;
  #mq: MediaQueryList | null = null;
  #root!: ShadowRoot;
  #track!: HTMLDivElement;
  #dots!: HTMLDivElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;
  #pullMap = new WeakMap<HTMLElement, MousePullState>();
  #focusMap = new WeakMap<
    HTMLElement,
    { scale: number; opacity: number; blur: number }
  >();
  #motionRaf: number | null = null;
  #lastMotionNow = 0;
  #lastFocusNow = 0;
  #inView = false;
  #lastAutoNow = 0;
  #autoCarry = 0;
  #hoverTargetIndex = -1;
  #hoverTargetSlide: HTMLElement | null = null;
  #hoverScrollCarry = 0;
  #io: IntersectionObserver | null = null;
  #ro: ResizeObserver | null = null;
  #lightboxRoot: HTMLElement | null = null;
  #lightboxKeyHandler: ((event: KeyboardEvent) => void) | null = null;
  #bodyOverflow = "";
  #loopAdjusting = false;
  #lastCloneSync = 0;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
  }

  get items() {
    return this.#items;
  }

  set onMediaOpen(handler: ((detail: GalleryOpenDetail) => void) | null) {
    this.#onMediaOpen = handler;
  }

  get onMediaOpen() {
    return this.#onMediaOpen;
  }

  set items(value: CarouselMediaItem[]) {
    this.#items = Array.isArray(value) ? value : [];
    this.#targetIndex = 0;
    this.#active = 0;
    this.#autoDir = 1;
    this.#autoCarry = 0;
    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    this.#render();
    this.#layoutSlides();
    this.#resetToStart();
    this.#restartAutoplay();
    if (this.isConnected) {
      this.#watchLayout();
      this.#watchView();
      this.#syncViewState();
    }
  }

  pauseAutoplay() {
    this.#lightboxOpen = true;
    this.#syncAutoPause();
  }

  resumeAutoplay() {
    this.#lightboxOpen = false;
    this.#syncAutoPause();
  }

  connectedCallback() {
    this.#mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.#reduced = this.#mq.matches;
    this.#mq.addEventListener("change", this.#onReducedChange);
    window.addEventListener("resize", this.#onResize);
    this.#render();
    this.#layoutSlides();
    this.#resetToStart();
    this.#restartAutoplay();
    this.#startMotion();
    this.#watchLayout();
    this.#watchView();
    this.#syncViewState();
  }

  #visibleRatio() {
    const rect = this.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return 0;
    const vh = window.innerHeight;
    const visibleHeight =
      Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visibleHeight <= 0) return 0;
    return visibleHeight / rect.height;
  }

  #syncViewState() {
    const ratio = this.#visibleRatio();
    const shouldBeInView = ratio >= 0.05;
    if (shouldBeInView && !this.#inView) {
      this.#inView = true;
      this.#syncMediaSources();
      this.#primeVisibleVideos();
      this.#mirrorCloneMedia(true);
    } else if (!shouldBeInView && this.#inView) {
      this.#inView = false;
      this.#syncPlayback();
    } else if (shouldBeInView) {
      this.#syncMediaSources();
      this.#primeVisibleVideos();
    }
    this.#syncAutoPause();
  }

  #watchView() {
    this.#io?.disconnect();
    if (!this.isConnected) return;

    this.#io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const ratio = entry.intersectionRatio;
        if (entry.isIntersecting && ratio >= 0.05) {
          if (!this.#inView) {
            this.#inView = true;
            this.#syncMediaSources();
            this.#primeVisibleVideos();
            this.#mirrorCloneMedia(true);
          } else {
            this.#syncMediaSources();
            this.#primeVisibleVideos();
          }
        } else if (!entry.isIntersecting || ratio < 0.02) {
          this.#inView = false;
          this.#syncPlayback();
        }
        this.#syncAutoPause();
      },
      { threshold: [0, 0.02, 0.05, 0.15, 0.35] },
    );
    this.#io.observe(this);
    this.#syncViewState();
  }

  #watchLayout() {
    this.#ro?.disconnect();
    let layoutFrame: number | null = null;
    this.#ro = new ResizeObserver(() => {
      if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
      layoutFrame = window.requestAnimationFrame(() => {
        layoutFrame = null;
        this.#layoutSlides();
        this.#normalizeLoop();
      });
    });
    if (this.#track) this.#ro.observe(this.#track);
    this.#ro.observe(this);
  }

  disconnectedCallback() {
    this.#hideLightbox();
    this.#mq?.removeEventListener("change", this.#onReducedChange);
    window.removeEventListener("resize", this.#onResize);
    this.#track?.removeEventListener("scroll", this.#onScroll);
    this.#io?.disconnect();
    this.#io = null;
    this.#ro?.disconnect();
    this.#ro = null;
    this.#stopAutoplay();
    this.#stopMotion();
    if (this.#userPauseTimer) window.clearTimeout(this.#userPauseTimer);
    if (this.#scrollRaf) window.cancelAnimationFrame(this.#scrollRaf);
    if (this.#scrollFrame) window.cancelAnimationFrame(this.#scrollFrame);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === "label" && this.#root.querySelector("[data-region]")) {
      const region = this.#root.querySelector<HTMLElement>("[data-region]");
      if (region) region.setAttribute("aria-label", value || "Gallery");
    }
  }

  #onReducedChange = (event: MediaQueryListEvent) => {
    this.#reduced = event.matches;
    this.#restartAutoplay();
  };

  #onResize = () => {
    this.#layoutSlides();
    this.#normalizeLoop();
    this.#syncFocus();
  };

  #isVisibleEnough() {
    return this.#inView;
  }

  #onScroll = () => {
    if (this.#loopAdjusting || this.#scrollFrame) return;
    this.#scrollFrame = window.requestAnimationFrame(() => {
      this.#scrollFrame = null;
      this.#normalizeLoop();
      this.#syncFocus();
    });
  };

  /** Distance from an original slide to its trailing clone — one full set. */
  #loopPeriod() {
    if (this.#items.length < 2 || !this.#track) return 0;
    const original = this.#slideEl(0);
    const clones = this.#track.querySelectorAll<HTMLElement>(
      '[data-slide="0"][data-clone="1"]',
    );
    const trailing = clones.length ? clones[clones.length - 1] : null;
    if (!original || !trailing) return 0;
    return trailing.offsetLeft - original.offsetLeft;
  }

  /** ScrollLeft that centers the first original — start of the seamless band. */
  #loopBandStart() {
    const original = this.#slideEl(0);
    if (!original) return 0;
    return this.#slideScrollLeft(original);
  }

  #wrapScrollLeft(target: number) {
    const maxLeft = this.#maxScroll();
    const period = this.#loopPeriod();
    if (period < 1) return Math.max(0, Math.min(maxLeft, target));

    const start = this.#loopBandStart();
    const offset = ((((target - start) % period) + period) % period);
    return Math.max(0, Math.min(maxLeft, start + offset));
  }

  /**
   * Signed distance to `to`, taking the shorter way around the seam. Every
   * slide exists three times, so a raw subtraction can point a full set the
   * wrong way and drag the track back over slides it just passed.
   */
  #shortestDelta(from: number, to: number) {
    const period = this.#loopPeriod();
    if (period < 1) return to - from;
    let delta = (to - from) % period;
    if (delta > period / 2) delta -= period;
    if (delta < -period / 2) delta += period;
    return delta;
  }

  #setScrollLeft(target: number) {
    if (!this.#track) return;
    this.#loopAdjusting = true;
    this.#track.scrollLeft = this.#wrapScrollLeft(target);
    this.#loopAdjusting = false;
  }

  #normalizeLoop() {
    if (!this.#track || this.#loopAdjusting) return;
    const period = this.#loopPeriod();
    if (period < 1) return;
    const start = this.#loopBandStart();
    const left = this.#track.scrollLeft;
    if (left < start || left >= start + period) {
      this.#setScrollLeft(left);
    }
  }

  #ensureLoopAnchor() {
    if (!this.#track || this.#items.length < 2) return;
    if (this.#loopPeriod() < 1) return;
    this.#setScrollLeft(this.#loopBandStart());
  }

  #slideEl(index: number) {
    return this.#track.querySelector<HTMLElement>(
      `[data-slide="${index}"]:not([data-clone])`,
    );
  }

  #label() {
    return this.getAttribute("label") || "Gallery";
  }

  #isDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  #maxScroll() {
    if (!this.#track) return 0;
    return Math.max(0, this.#track.scrollWidth - this.#track.clientWidth);
  }

  #slideBasisPx() {
    if (!this.#track) return 0;
    const style = getComputedStyle(this.#track);
    const pad =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const inner = Math.max(0, this.#track.clientWidth - pad);
    if (inner < 768) return inner * 0.76;
    if (inner < 1280) return inner * 0.68;
    if (inner < 1536) return inner * 0.62;
    return inner * 0.58;
  }

  #layoutSlides() {
    if (!this.#track) return;
    const basis = this.#slideBasisPx();
    if (basis < 1) return;
    this.#track.querySelectorAll<HTMLElement>(".slide").forEach((slide) => {
      slide.style.flex = `0 0 ${basis}px`;
      slide.style.width = `${basis}px`;
    });
  }

  #resetToStart() {
    this.#cancelScrollAnimation();
    this.#autoCarry = 0;
    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    this.#active = 0;
    this.#targetIndex = 0;
    this.#autoDir = 1;
    this.#layoutSlides();
    this.#centerSlide(0, false);
    this.#ensureLoopAnchor();
    this.#updateChrome();
    this.#syncPlayback();
  }

  #syncAutoPause() {
    this.#autoPaused =
      this.#lightboxOpen ||
      this.#userPaused ||
      this.#dragMoved ||
      !this.#isVisibleEnough() ||
      this.#items.length < 2 ||
      (this.#hoverTargetIndex >= 0 && this.#isDesktop());
  }

  #cancelScrollAnimation() {
    if (!this.#scrollRaf) return;
    window.cancelAnimationFrame(this.#scrollRaf);
    this.#scrollRaf = null;
    this.#syncAutoPause();
  }

  #onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      this.#pauseForUser();
      return;
    }
    if (!this.#isDesktop()) return;
    if (event.button !== 0) return;
    if (!this.#track) return;
    const onSlide = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-slide]",
    );
    if (onSlide) return;
    if (this.#items.length < 2) return;

    this.#cancelScrollAnimation();
    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    this.#dragging = true;
    this.#dragMoved = false;
    this.#suppressClick = false;
    this.#pointerId = event.pointerId;
    this.#dragStartX = event.clientX;
    this.#dragStartScroll = this.#track.scrollLeft;
    this.#syncAutoPause();
  };

  #onPointerMove = (event: PointerEvent) => {
    if (!this.#dragging || !this.#track || event.pointerId !== this.#pointerId) {
      return;
    }
    const dx = event.clientX - this.#dragStartX;
    if (Math.abs(dx) <= DRAG_THRESHOLD) return;

    if (!this.#dragMoved) {
      this.#dragMoved = true;
      this.#track.classList.add("is-dragging");
      this.#pauseForUser();
      if (!this.#track.hasPointerCapture(event.pointerId)) {
        this.#track.setPointerCapture(event.pointerId);
      }
    }

    const maxLeft = Math.max(
      0,
      this.#track.scrollWidth - this.#track.clientWidth,
    );
    this.#track.scrollLeft = Math.max(
      0,
      Math.min(maxLeft, this.#dragStartScroll - dx),
    );
  };

  #onPointerUp = (event: PointerEvent) => {
    if (!this.#dragging || event.pointerId !== this.#pointerId) return;

    const wasDrag = this.#dragMoved;
    this.#dragging = false;
    this.#pointerId = -1;
    this.#track?.classList.remove("is-dragging");
    if (this.#track?.hasPointerCapture(event.pointerId)) {
      this.#track.releasePointerCapture(event.pointerId);
    }

    if (!wasDrag && event.button === 0) {
      // Clicks on slides are handled by slide listeners — drag is track-padding only.
    } else if (wasDrag) {
      this.#suppressClick = true;
    }

    this.#dragMoved = false;
    this.#syncAutoPause();
  };

  #stopAutoplay() {
    if (this.#autoRaf) {
      window.cancelAnimationFrame(this.#autoRaf);
      this.#autoRaf = null;
    }
  }

  #pullFor(el: HTMLElement) {
    let state = this.#pullMap.get(el);
    if (!state) {
      state = createMousePullState();
      this.#pullMap.set(el, state);
    }
    return state;
  }

  #stopMotion() {
    if (this.#motionRaf) {
      window.cancelAnimationFrame(this.#motionRaf);
      this.#motionRaf = null;
    }
  }

  #startMotion() {
    this.#stopMotion();
    this.#lastMotionNow = performance.now();
    const tick = (now: number) => {
      this.#motionRaf = window.requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(48, now - this.#lastMotionNow);
      this.#lastMotionNow = now;
      if (!this.#scrollRaf) {
        this.#stepHoverFocus(dt);
      }
      this.#syncFocus(now, dt);
      this.#mirrorCloneMedia();
    };
    this.#motionRaf = window.requestAnimationFrame(tick);
  }

  /** Softly pursue the hovered slide instead of jumping with a timed animation. */
  #stepHoverFocus(dt: number) {
    if (
      !this.#track ||
      !this.#isDesktop() ||
      this.#dragging ||
      this.#lightboxOpen ||
      this.#hoverTargetIndex < 0
    ) {
      return;
    }

    const slide = this.#hoverTargetSlide;
    if (!slide) return;

    const targetLeft = this.#wrapScrollLeft(this.#slideScrollLeft(slide));
    const current = this.#track.scrollLeft;
    const delta = this.#shortestDelta(current, targetLeft);

    if (Math.abs(delta) < 0.35) {
      if (current !== targetLeft) this.#setScrollLeft(targetLeft);
      this.#hoverScrollCarry = 0;
      return;
    }

    const tau = this.#reduced ? HOVER_SCROLL_TAU_MS * 0.45 : HOVER_SCROLL_TAU_MS;
    const k = 1 - Math.exp(-dt / tau);
    this.#hoverScrollCarry += delta * k;

    if (Math.abs(this.#hoverScrollCarry) >= 0.5) {
      const step = Math.round(this.#hoverScrollCarry);
      this.#hoverScrollCarry -= step;
      this.#setScrollLeft(current + step);
    }
  }

  #restartAutoplay() {
    this.#stopAutoplay();
    if (this.#items.length < 2) return;

    this.#lastAutoNow = performance.now();
    const tick = (now: number) => {
      this.#autoRaf = window.requestAnimationFrame(tick);
      const dt = Math.min(0.048, (now - this.#lastAutoNow) / 1000);
      this.#lastAutoNow = now;
      this.#syncAutoPause();
      if (this.#autoPaused || !this.#track || this.#scrollRaf) return;

      if (this.#maxScroll() < 1) {
        this.#layoutSlides();
        return;
      }

      const speed = this.#reduced ? AUTO_PX_PER_SEC * 0.35 : AUTO_PX_PER_SEC;
      this.#autoCarry += speed * dt;
      const step = Math.floor(this.#autoCarry);
      if (step < 1) return;
      this.#autoCarry -= step;

      let next = this.#track.scrollLeft + step;
      this.#setScrollLeft(next);
    };

    this.#autoRaf = window.requestAnimationFrame(tick);
  }

  #pauseForUser() {
    if (this.#userPauseTimer) window.clearTimeout(this.#userPauseTimer);
    this.#userPaused = true;
    this.#syncAutoPause();
    this.#userPauseTimer = window.setTimeout(() => {
      this.#userPauseTimer = null;
      this.#userPaused = false;
      this.#syncAutoPause();
    }, USER_PAUSE_MS);
  }

  #render() {
    this.#stopAutoplay();
    this.#cancelScrollAnimation();
    this.classList.toggle(
      "is-stills",
      this.#items.length > 0 && this.#items.every((item) => !isVideo(item)),
    );
    const label = this.#label();

    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <div class="wrap" data-region role="region" aria-roledescription="carousel" aria-label="${escapeAttr(label)}">
        <div class="viewport">
          <div class="track" part="track"></div>
        </div>
        <div class="controls" part="controls">
          <button type="button" class="nav-btn" data-prev aria-label="Previous">PREV</button>
          <div class="dots" role="tablist" aria-label="Slides" data-dots></div>
          <button type="button" class="nav-btn" data-next aria-label="Next">NEXT</button>
        </div>
      </div>
    `;

    this.#track = this.#root.querySelector(".track")!;
    this.#dots = this.#root.querySelector("[data-dots]")!;
    this.#prevBtn = this.#root.querySelector("[data-prev]")!;
    this.#nextBtn = this.#root.querySelector("[data-next]")!;

    this.#track.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#track.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) + 2) {
          this.#pauseForUser();
        }
      },
      { passive: true },
    );
    this.#track.addEventListener("pointerdown", this.#onPointerDown);
    this.#track.addEventListener("pointermove", this.#onPointerMove);
    this.#track.addEventListener("pointerup", this.#onPointerUp);
    this.#track.addEventListener("pointercancel", this.#onPointerUp);
    this.#track.addEventListener("mousemove", this.#onTrackMouseMove);
    this.#track.addEventListener("mouseleave", this.#onTrackMouseLeave);
    this.#track.addEventListener("dragstart", (event) => event.preventDefault());
    this.#track.addEventListener("click", this.#onTrackClick);

    this.#prevBtn.addEventListener("click", () => {
      this.#pauseForUser();
      this.#goTo(Math.max(0, this.#active - 1));
    });
    this.#nextBtn.addEventListener("click", () => {
      this.#pauseForUser();
      this.#goTo(Math.min(this.#items.length - 1, this.#active + 1));
    });

    this.#track.innerHTML = "";
    this.#dots.innerHTML = "";

    if (this.#items.length > 1) {
      this.#items.forEach((item, index) => {
        this.#track.appendChild(this.#createSlide(item, index, true));
      });
    }

    this.#items.forEach((item, index) => {
      this.#track.appendChild(this.#createSlide(item, index));
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => {
        this.#pauseForUser();
        this.#goTo(index);
      });
      this.#dots.appendChild(dot);
    });

    if (this.#items.length > 1) {
      this.#items.forEach((item, index) => {
        this.#track.appendChild(this.#createSlide(item, index, true));
      });
    }

    this.#updateChrome();
    this.#layoutSlides();
  }

  #createSlide(item: CarouselMediaItem, index: number, clone = false) {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.dataset.slide = String(index);
    if (clone) slide.dataset.clone = "1";
    if (!clone) {
      slide.tabIndex = 0;
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-label", `${item.alt}. Click to view larger.`);
    } else {
      slide.tabIndex = -1;
    }
    slide.setAttribute(
      "aria-hidden",
      clone || index !== 0 ? "true" : "false",
    );

    const frame = document.createElement("div");
    frame.className = "frame";
    const visual = document.createElement("div");
    visual.className = "slide-visual";

    if (isVideo(item)) {
      const video = document.createElement("video");
      video.className = "media";
      video.playsInline = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.preload = "metadata";
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("muted", "");
      video.setAttribute("aria-label", item.alt);
      video.controls = false;

      const markLoaded = () => {
        video.classList.add("is-loaded");
      };
      video.addEventListener("loadeddata", markLoaded);
      video.addEventListener("canplay", markLoaded);
      video.addEventListener("error", markLoaded);
      video.dataset.src = item.src;
      if (video.readyState >= 2) markLoaded();
      frame.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "media";
      img.decoding = "async";
      img.loading = "eager";
      img.alt = item.alt;
      img.src = item.src;
      const markLoaded = () => {
        img.classList.add("is-loaded");
      };
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markLoaded);
      if (img.complete) markLoaded();
      void img.decode?.().then(markLoaded).catch(markLoaded);
      frame.appendChild(img);
    }

    visual.appendChild(frame);
    slide.appendChild(visual);

    const openSlide = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.#suppressClick) {
        this.#suppressClick = false;
        return;
      }
      this.#openItem(index);
    };
    slide.addEventListener("click", openSlide, true);

    slide.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.#openItem(index);
    });

    return slide;
  }

  #onTrackClick = (event: MouseEvent) => {
    if (this.#suppressClick) {
      this.#suppressClick = false;
      return;
    }
    const slide =
      (event.target as HTMLElement).closest<HTMLElement>("[data-slide]") ??
      this.#slideAtClientX(event.clientX);
    if (!slide) return;
    const index = Number(slide.dataset.slide);
    if (Number.isNaN(index)) return;
    this.#openItem(index);
  };

  #openItem(index: number) {
    const item = this.#items[index];
    if (!item) return;
    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    this.pauseAutoplay();

    const detail: GalleryOpenDetail = { ...item, index };
    this.#showLightbox(detail);
    this.#onMediaOpen?.(detail);
    this.dispatchEvent(
      new CustomEvent<GalleryOpenDetail>("ah-media-open", {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  #showLightbox(detail: GalleryOpenDetail) {
    if (typeof document === "undefined") return;
    ensureLightboxStyles();
    this.#hideLightbox(false);

    const video = isVideo(detail);
    const root = document.createElement("div");
    root.className = "ah-media-lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", detail.alt);
    root.innerHTML = `
      <button type="button" class="ah-media-lightbox__backdrop" aria-label="Close media viewer"></button>
      <div class="ah-media-lightbox__frame">
        <button type="button" class="ah-media-lightbox__close" aria-label="Close">×</button>
        <div class="ah-media-lightbox__media-wrap">
          ${
            video
              ? `<video class="ah-media-lightbox__media" src="${escapeAttr(detail.src)}" controls autoplay muted playsinline webkit-playsinline aria-label="${escapeAttr(detail.alt)}"></video>`
              : `<img class="ah-media-lightbox__media" src="${escapeAttr(detail.src)}" alt="${escapeAttr(detail.alt)}" />`
          }
        </div>
      </div>
    `;

    const close = () => this.#hideLightbox();
    root
      .querySelector(".ah-media-lightbox__backdrop")
      ?.addEventListener("click", close);
    root
      .querySelector(".ah-media-lightbox__close")
      ?.addEventListener("click", close);
    root
      .querySelector(".ah-media-lightbox__media-wrap")
      ?.addEventListener("click", (event) => event.stopPropagation());

    this.#lightboxKeyHandler = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", this.#lightboxKeyHandler);

    this.#bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.appendChild(root);
    this.#lightboxRoot = root;
    (
      root.querySelector(".ah-media-lightbox__close") as HTMLButtonElement | null
    )?.focus();
  }

  #hideLightbox(resume = true) {
    if (this.#lightboxKeyHandler) {
      window.removeEventListener("keydown", this.#lightboxKeyHandler);
      this.#lightboxKeyHandler = null;
    }
    this.#lightboxRoot?.remove();
    this.#lightboxRoot = null;
    if (typeof document !== "undefined") {
      document.body.style.overflow = this.#bodyOverflow;
    }
    if (resume && this.#lightboxOpen) this.resumeAutoplay();
  }

  #scheduleFocus(centerActive = false) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (centerActive) this.#centerSlide(this.#active, false);
        this.#syncFocus();
      });
    });
  }

  #slideScrollLeft(slide: HTMLElement) {
    return slide.offsetLeft - (this.#track.clientWidth - slide.offsetWidth) / 2;
  }

  /** Pick the physical slide under the cursor — original or loop clone. */
  #slideAtClientX(clientX: number) {
    const slides = Array.from(
      this.#track.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    if (!slides.length) return null;

    const trackRect = this.#track.getBoundingClientRect();
    if (clientX <= trackRect.left) return slides[0]!;
    if (clientX >= trackRect.right) return slides[slides.length - 1]!;

    let hit: HTMLElement | null = null;
    let hitDist = Infinity;
    for (const slide of slides) {
      const rect = slide.getBoundingClientRect();
      const zoneLeft = Math.max(rect.left, trackRect.left);
      const zoneRight = Math.min(rect.right, trackRect.right);
      if (clientX < zoneLeft || clientX > zoneRight) continue;
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(clientX - mid);
      if (dist < hitDist) {
        hitDist = dist;
        hit = slide;
      }
    }
    if (hit) return hit;

    const centers = slides.map((slide) => ({
      slide,
      center: slide.getBoundingClientRect().left + slide.getBoundingClientRect().width / 2,
    }));

    if (clientX <= centers[0]!.center) return centers[0]!.slide;

    for (let i = 0; i < centers.length - 1; i++) {
      const boundary = (centers[i]!.center + centers[i + 1]!.center) / 2;
      if (clientX < boundary) return centers[i]!.slide;
    }

    return centers[centers.length - 1]!.slide;
  }

  #centerSlide(index: number, animated: boolean) {
    const slide = this.#slideEl(index);
    if (!slide) return;
    const targetLeft = this.#wrapScrollLeft(this.#slideScrollLeft(slide));
    if (animated && !this.#reduced) {
      this.#animateScrollTo(targetLeft, FOCUS_GLIDE_MS, index);
    } else {
      this.#setScrollLeft(targetLeft);
    }
  }

  #closestSlideMid(index: number, trackRect: DOMRect) {
    const physical = this.#track.querySelectorAll<HTMLElement>(
      `[data-slide="${index}"]`,
    );
    let bestMid = 0;
    let bestDist = Infinity;
    physical.forEach((slide) => {
      const mid =
        trackRect.left +
        (slide.offsetLeft - this.#track.scrollLeft) +
        slide.offsetWidth / 2;
      const dist = Math.abs(
        mid - (trackRect.left + trackRect.width / 2),
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestMid = mid;
      }
    });
    return { mid: bestMid, dist: bestDist };
  }

  #syncFocus(now = performance.now(), dtOverride?: number) {
    const slides = Array.from(
      this.#track.querySelectorAll<HTMLElement>(
        '[data-slide]:not([data-clone="1"])',
      ),
    );
    if (!slides.length) return;

    const gliding = Boolean(this.#scrollRaf) || this.#hoverTargetIndex >= 0;
    const dt =
      dtOverride ??
      Math.min(48, now - (this.#lastFocusNow || now - 16));
    this.#lastFocusNow = now;
    const focusK = 1 - Math.exp(-dt / FOCUS_LERP_MS);

    const trackRect = this.#track.getBoundingClientRect();
    const falloff = Math.max(trackRect.width * FOCUS_FALLOFF, 1);

    let best = 0;
    let bestAmount = -1;
    let bestSlide: HTMLElement | null = null;

    slides.forEach((slide) => {
      const visual =
        slide.querySelector<HTMLElement>(".slide-visual") ?? slide;
      const slideIndex = Number(slide.dataset.slide);
      const { dist } = this.#closestSlideMid(slideIndex, trackRect);
      const amount = Math.max(0, Math.min(1, 1 - dist / falloff));
      const focus = smoothstep(amount);
      const centerClearPx = Math.max(10, slide.offsetWidth * 0.045);
      const isCentered = dist <= centerClearPx;

      const targetScale = SCALE_MIN + focus * (SCALE_MAX - SCALE_MIN);
      const targetOpacity = OPACITY_MIN + focus * (OPACITY_MAX - OPACITY_MIN);
      const targetBlur = isCentered ? 0 : BLUR_MAX * (1 - focus);

      let smoothed = this.#focusMap.get(slide);
      if (!smoothed) {
        smoothed = {
          scale: targetScale,
          opacity: targetOpacity,
          blur: targetBlur,
        };
        this.#focusMap.set(slide, smoothed);
      } else if (isCentered) {
        smoothed.scale += (SCALE_MAX - smoothed.scale) * focusK;
        smoothed.opacity = OPACITY_MAX;
        smoothed.blur = 0;
      } else {
        smoothed.scale += (targetScale - smoothed.scale) * focusK;
        smoothed.opacity += (targetOpacity - smoothed.opacity) * focusK;
        smoothed.blur += (targetBlur - smoothed.blur) * focusK;
      }

      const scale = smoothed.scale;
      const opacity = smoothed.opacity;
      const blur = smoothed.blur;
      const pose = `scale(${scale.toFixed(4)})`;
      visual.style.transformOrigin = "50% 50%";
      if (
        this.#reduced ||
        !this.#isDesktop() ||
        window.matchMedia("(pointer: coarse)").matches
      ) {
        // Scale via transform blacks out <video> on Android Chrome.
        visual.style.transform = "none";
        visual.style.transformStyle = "flat";
      } else {
        visual.style.transformStyle = "preserve-3d";
        const pull = stepMousePull(
          this.#pullFor(slide),
          visual,
          now,
          dt,
          "gallery",
          0.5,
        );
        visual.style.transform = withIdleHover(pose, {
          x: pull.x,
          y: pull.y,
          z: pull.z,
          rot: 0,
          rotX: pull.rotX,
          rotY: pull.rotY,
        });
      }
      visual.style.opacity = String(opacity);
      visual.style.filter = blur < 0.08 ? "none" : `blur(${blur.toFixed(2)}px)`;

      if (amount > bestAmount) {
        bestAmount = amount;
        best = slideIndex;
        bestSlide = slide;
      }
    });

    this.#mirrorCloneFocus();

    slides.forEach((slide) => {
      slide.style.zIndex = slide === bestSlide ? "2" : "1";
    });

    if (best !== this.#active) {
      const focusedSlide = bestSlide ?? slides[0];
      if (!focusedSlide) return;
      const slideIndex = Number(focusedSlide.dataset.slide);
      const { dist: bestDist } = this.#closestSlideMid(slideIndex, trackRect);
      const bestAmount = Math.max(0, Math.min(1, 1 - bestDist / falloff));
      const shouldCommit =
        !gliding || bestAmount > 0.72 || best === this.#hoverTargetIndex;

      if (shouldCommit) {
        this.#active = best;
        this.#targetIndex = best;
        this.#updateChrome();
        this.#syncPlayback();
      }
    }
  }

  #mirrorCloneFocus() {
    this.#track
      .querySelectorAll<HTMLElement>('[data-clone="1"]')
      .forEach((clone) => {
        const original = this.#slideEl(Number(clone.dataset.slide));
        if (!original) return;
        const originalVisual =
          original.querySelector<HTMLElement>(".slide-visual") ?? original;
        const cloneVisual =
          clone.querySelector<HTMLElement>(".slide-visual") ?? clone;
        cloneVisual.style.transform = originalVisual.style.transform;
        cloneVisual.style.opacity = originalVisual.style.opacity;
        cloneVisual.style.filter = originalVisual.style.filter;
      });
  }

  /**
   * Seeking every clone on every frame stalls the decoder, so only reconcile
   * periodically and only when a clone has actually drifted.
   */
  #mirrorCloneMedia(force = false) {
    const now = performance.now();
    if (!force && now - this.#lastCloneSync < 250) return;
    this.#lastCloneSync = now;

    this.#track
      .querySelectorAll<HTMLElement>('[data-clone="1"]')
      .forEach((clone) => {
        const index = Number(clone.dataset.slide);
        if (Number.isNaN(index)) return;
        const original = this.#slideEl(index);
        if (!original) return;

        const originalVideo = original.querySelector<HTMLVideoElement>("video");
        const cloneVideo = clone.querySelector<HTMLVideoElement>("video");
        if (!originalVideo || !cloneVideo || !cloneVideo.dataset.src) return;

        if (
          originalVideo.dataset.hydrated === "1" &&
          cloneVideo.dataset.hydrated !== "1"
        ) {
          this.#hydrateVideo(cloneVideo, cloneVideo.dataset.src);
        }

        const syncFrame = () => {
          if (originalVideo.readyState < 2) return;
          cloneVideo.classList.add("is-loaded");
          cloneVideo.dataset.primed = "1";
          if (
            Math.abs(cloneVideo.currentTime - originalVideo.currentTime) < 0.25
          ) {
            return;
          }
          try {
            cloneVideo.currentTime = originalVideo.currentTime;
          } catch {
            /* ignore seek errors on some mobile browsers */
          }
        };

        if (cloneVideo.readyState >= 2) {
          syncFrame();
        } else {
          cloneVideo.addEventListener("loadeddata", syncFrame, { once: true });
        }
      });
  }

  #hydrateVideo(video: HTMLVideoElement, src: string) {
    if (video.dataset.hydrated === "1" || !src) return;
    video.dataset.hydrated = "1";
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");
    video.src = src;
    video.load();
  }

  #primeVideoFrame(video: HTMLVideoElement) {
    if (video.dataset.primed === "1") return;

    const markPrimed = () => {
      if (video.dataset.primed === "1") return;
      video.dataset.primed = "1";
      video.classList.add("is-loaded");
    };

    const prime = () => {
      void video
        .play()
        .then(() => {
          video.pause();
          try {
            video.currentTime = 0;
          } catch {
            /* ignore seek errors on some mobile browsers */
          }
          markPrimed();
        })
        .catch(() => {
          try {
            video.currentTime = 0.001;
          } catch {
            /* ignore */
          }
          markPrimed();
        });
    };

    if (video.readyState >= 2) {
      prime();
      return;
    }

    video.addEventListener(
      "loadeddata",
      () => {
        prime();
      },
      { once: true },
    );
  }

  #syncMediaSources() {
    if (!this.#inView || !this.#track) return;

    this.#track.querySelectorAll<HTMLElement>("[data-slide]").forEach((slide) => {
      const video = slide.querySelector<HTMLVideoElement>("video");
      const src = video?.dataset.src;
      if (!video || !src) return;
      this.#hydrateVideo(video, src);
    });

    this.#mirrorCloneMedia();
  }

  #playTargetIndex() {
    if (!this.#inView || this.#lightboxOpen) return -1;
    if (this.#isDesktop() && this.#hoverTargetIndex >= 0) {
      return this.#hoverTargetIndex;
    }
    return -1;
  }

  #syncPlayback() {
    const playTarget = this.#playTargetIndex();
    const slides = this.#track.querySelectorAll<HTMLElement>("[data-slide]");
    slides.forEach((slide) => {
      const slideIndex = Number(slide.dataset.slide);
      const isClone = slide.dataset.clone === "1";
      const video = slide.querySelector<HTMLVideoElement>("video");
      const active = !isClone && slideIndex === this.#active;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (!video) return;
      video.controls = false;
      video.muted = true;

      const shouldPlay = !isClone && slideIndex === playTarget;
      if (shouldPlay) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
    this.#syncMediaSources();
    this.#primeVisibleVideos();
    this.#mirrorCloneMedia();
  }

  #primeVisibleVideos() {
    if (!this.#inView || !this.#track) return;
    const playTarget = this.#playTargetIndex();

    this.#track.querySelectorAll<HTMLElement>("[data-slide]").forEach((slide) => {
      const slideIndex = Number(slide.dataset.slide);
      if (Number.isNaN(slideIndex)) return;
      const video = slide.querySelector<HTMLVideoElement>("video");
      if (!video || video.dataset.hydrated !== "1") return;
      if (slide.dataset.clone) return;
      if (slideIndex === playTarget) return;
      const dist = Math.abs(slideIndex - this.#active);
      if (dist <= 2) this.#primeVideoFrame(video);
    });
  }

  #updateChrome() {
    const multi = this.#items.length > 1;
    const controls = this.#root.querySelector<HTMLElement>(".controls");
    if (controls) controls.hidden = !multi;

    this.#prevBtn.disabled = this.#active <= 0 || this.#items.length === 0;
    this.#nextBtn.disabled =
      this.#active >= this.#items.length - 1 || this.#items.length === 0;

    Array.from(this.#dots.children).forEach((dot, index) => {
      (dot as HTMLElement).setAttribute(
        "aria-selected",
        index === this.#active ? "true" : "false",
      );
    });
  }

  #animateScrollTo(
    targetLeft: number,
    duration: number,
    targetIndex = this.#targetIndex,
  ) {
    if (this.#scrollRaf) window.cancelAnimationFrame(this.#scrollRaf);

    const start = this.#track.scrollLeft;
    const delta = this.#shortestDelta(start, targetLeft);
    if (Math.abs(delta) < 0.5) {
      this.#active = targetIndex;
      this.#targetIndex = targetIndex;
      this.#updateChrome();
      this.#syncPlayback();
      return;
    }

    this.#targetIndex = targetIndex;

    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      this.#setScrollLeft(start + delta * easeInOutCubic(t));
      this.#syncFocus(now, Math.min(48, now - startTime));
      if (t < 1) {
        this.#scrollRaf = window.requestAnimationFrame(step);
      } else {
        this.#setScrollLeft(targetLeft);
        this.#scrollRaf = null;
        this.#normalizeLoop();
        this.#active = targetIndex;
        this.#targetIndex = targetIndex;
        this.#syncFocus(now);
        this.#updateChrome();
        this.#syncPlayback();
      }
    };
    this.#scrollRaf = window.requestAnimationFrame(step);
  }

  #goTo(index: number) {
    if (!this.#items.length || !this.#track) return;

    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    const clamped = Math.max(0, Math.min(this.#items.length - 1, index));
    const slide = this.#slideEl(clamped);
    if (!slide) return;
    this.#layoutSlides();
    const targetLeft = this.#wrapScrollLeft(this.#slideScrollLeft(slide));
    if (
      clamped === this.#targetIndex &&
      Math.abs(this.#shortestDelta(this.#track.scrollLeft, targetLeft)) < 8
    ) {
      return;
    }

    this.#targetIndex = clamped;
    this.#centerSlide(clamped, true);
  }

  #onTrackMouseMove = (event: MouseEvent) => {
    if (!this.#isDesktop() || this.#dragging || this.#lightboxOpen) {
      return;
    }
    const slide = this.#slideAtClientX(event.clientX);
    if (!slide) return;
    const index = Number(slide.dataset.slide);
    if (Number.isNaN(index) || index === this.#hoverTargetIndex) return;

    this.#cancelScrollAnimation();
    this.#hoverTargetSlide = this.#slideEl(index) ?? slide;
    this.#hoverTargetIndex = index;
    this.#targetIndex = index;
    this.#syncAutoPause();
    this.#syncPlayback();
  };

  #onTrackMouseLeave = () => {
    this.#hoverTargetIndex = -1;
    this.#hoverTargetSlide = null;
    this.#hoverScrollCarry = 0;
    this.#normalizeLoop();
    this.#syncAutoPause();
    this.#syncPlayback();
  };
}

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

declare global {
  interface HTMLElementTagNameMap {
    "ah-media-gallery-v32": AhMediaCarousel;
  }
}

export function defineAhMediaCarousel() {
  if (
    typeof window !== "undefined" &&
    !customElements.get("ah-media-gallery-v32")
  ) {
    customElements.define("ah-media-gallery-v32", AhMediaCarousel);
  }
}
