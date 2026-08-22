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
const BLUR_MAX = 4;
const AUTO_SPEED = 0.28; // px per frame — slow continuous drift
const USER_PAUSE_MS = 4200;

const STYLES = /* css */ `
:host {
  display: block;
  width: 100%;
  color: #d2d2d2;
  font-family: var(--font-display, "Montserrat", system-ui, sans-serif);
  transform-style: preserve-3d;
  perspective: 920px;
}

* {
  box-sizing: border-box;
}

.wrap {
  width: 100%;
  perspective: 920px;
  transform-style: preserve-3d;
}

.viewport {
  width: 100%;
  transform-style: preserve-3d;
  border: 1.5px solid rgb(214 208 186 / 0.42);
  border-radius: 1.35rem;
  box-shadow:
    0 0 14px rgb(232 223 196 / 0.2),
    inset 0 0 0 1px rgb(255 255 255 / 0.08);
}

.track {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 2rem 12%;
  scroll-behavior: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  transform-style: preserve-3d;
}

.track::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .viewport {
    overflow: visible;
    background: transparent;
  }

  .track {
    gap: 1rem;
    padding: 2.5rem 18%;
    cursor: grab;
    touch-action: pan-y;
  }

  .track.is-dragging {
    cursor: grabbing;
    user-select: none;
  }

  .track.is-dragging .slide {
    cursor: grabbing;
  }
}

.slide {
  position: relative;
  z-index: 1;
  width: 76%;
  max-width: 42rem;
  flex-shrink: 0;
  cursor: pointer;
  overflow: visible;
  transform-origin: 50% 50%;
  transform-style: preserve-3d;
  will-change: transform, opacity, filter;
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1.5px solid rgb(214 208 186 / 0.38);
  background: #080809;
  box-shadow:
    0 0 16px rgb(232 223 196 / 0.18),
    inset 0 0 0 1px rgb(255 255 255 / 0.08);
  transform-style: preserve-3d;
}

@media (min-width: 768px) {
  .slide {
    width: 68%;
  }
}

@media (min-width: 1280px) {
  .track {
    padding: 2.75rem 14%;
  }

  .slide {
    width: 62%;
    max-width: 52rem;
  }
}

@media (min-width: 1536px) {
  .track {
    padding: 3rem 12%;
  }

  .slide {
    width: 58%;
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
  transform: scale(1.08);
  transform-origin: center center;
  opacity: 1;
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

function isVideo(item: CarouselMediaItem) {
  return item.type === "video" || /\.(mp4|webm|mov)$/i.test(item.src);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
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
  #hoverTimer: number | null = null;
  #scrollRaf: number | null = null;
  #scrollFrame: number | null = null;
  #autoRaf: number | null = null;
  #autoDir = 1;
  #autoPaused = false;
  #lightboxOpen = false;
  #hoverPaused = false;
  #userPaused = false;
  #userPauseTimer: number | null = null;
  #dragging = false;
  #dragMoved = false;
  #dragStartX = 0;
  #dragStartScroll = 0;
  #suppressClick = false;
  #mq: MediaQueryList | null = null;
  #root!: ShadowRoot;
  #track!: HTMLDivElement;
  #dots!: HTMLDivElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;
  #pullMap = new WeakMap<HTMLElement, MousePullState>();
  #motionRaf: number | null = null;
  #lastMotionNow = 0;
  #inView = false;
  #io: IntersectionObserver | null = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
  }

  get items() {
    return this.#items;
  }

  set items(value: CarouselMediaItem[]) {
    this.#items = Array.isArray(value) ? value : [];
    this.#targetIndex = 0;
    this.#active = 0;
    this.#autoDir = 1;
    this.#render();
    this.#scheduleFocus(true);
    this.#restartAutoplay();
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
    this.#scheduleFocus(true);
    this.#restartAutoplay();
    this.#startMotion();
    this.#watchView();
  }

  disconnectedCallback() {
    this.#mq?.removeEventListener("change", this.#onReducedChange);
    window.removeEventListener("resize", this.#onResize);
    this.#track?.removeEventListener("scroll", this.#onScroll);
    this.#io?.disconnect();
    this.#io = null;
    this.#stopAutoplay();
    this.#stopMotion();
    if (this.#hoverTimer) window.clearTimeout(this.#hoverTimer);
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
    this.#syncFocus();
  };

  #onScroll = () => {
    if (this.#scrollFrame) return;
    this.#scrollFrame = window.requestAnimationFrame(() => {
      this.#scrollFrame = null;
      this.#syncFocus();
    });
  };

  #label() {
    return this.getAttribute("label") || "Gallery";
  }

  #isDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  #watchView() {
    this.#io?.disconnect();
    this.#io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.18,
        );
        if (visible === this.#inView) return;
        this.#inView = visible;
        if (visible) {
          this.#active = 0;
          this.#targetIndex = 0;
          this.#autoDir = 1;
          this.#centerSlide(0, false);
          this.#scheduleFocus(true);
        }
        this.#restartAutoplay();
      },
      { threshold: [0, 0.18, 0.35] },
    );
    this.#io.observe(this);
  }

  #syncAutoPause() {
    this.#autoPaused =
      this.#reduced ||
      this.#lightboxOpen ||
      this.#hoverPaused ||
      this.#userPaused ||
      this.#dragging ||
      !this.#inView ||
      this.#items.length < 2 ||
      Boolean(this.#scrollRaf);
  }

  #cancelScrollAnimation() {
    if (!this.#scrollRaf) return;
    window.cancelAnimationFrame(this.#scrollRaf);
    this.#scrollRaf = null;
    this.#syncAutoPause();
  }

  #onPointerDown = (event: PointerEvent) => {
    if (!this.#isDesktop()) return;
    if (event.pointerType === "touch") return;
    if (event.button !== 0) return;
    if (!this.#track || this.#items.length < 2) return;

    this.#cancelScrollAnimation();
    this.#dragging = true;
    this.#dragMoved = false;
    this.#suppressClick = false;
    this.#dragStartX = event.clientX;
    this.#dragStartScroll = this.#track.scrollLeft;
    this.#track.setPointerCapture(event.pointerId);
    this.#pauseForUser();
    this.#syncAutoPause();
  };

  #onPointerMove = (event: PointerEvent) => {
    if (!this.#dragging || !this.#track) return;
    const dx = event.clientX - this.#dragStartX;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      if (!this.#dragMoved) {
        this.#dragMoved = true;
        this.#track.classList.add("is-dragging");
      }
      const maxLeft = Math.max(
        0,
        this.#track.scrollWidth - this.#track.clientWidth,
      );
      this.#track.scrollLeft = Math.max(
        0,
        Math.min(maxLeft, this.#dragStartScroll - dx),
      );
    }
  };

  #onPointerUp = (event: PointerEvent) => {
    if (!this.#dragging) return;
    this.#dragging = false;
    this.#track?.classList.remove("is-dragging");
    if (this.#track?.hasPointerCapture(event.pointerId)) {
      this.#track.releasePointerCapture(event.pointerId);
    }
    if (this.#dragMoved) this.#suppressClick = true;
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
      this.#syncFocus(now);
    };
    this.#motionRaf = window.requestAnimationFrame(tick);
  }

  #restartAutoplay() {
    this.#stopAutoplay();
    this.#syncAutoPause();
    if (this.#reduced || this.#items.length < 2) return;

    const tick = () => {
      this.#autoRaf = window.requestAnimationFrame(tick);
      this.#syncAutoPause();
      if (this.#autoPaused || !this.#track) return;

      const maxLeft = Math.max(
        0,
        this.#track.scrollWidth - this.#track.clientWidth,
      );
      if (maxLeft < 1) return;

      let next = this.#track.scrollLeft + this.#autoDir * AUTO_SPEED;
      if (next >= maxLeft) {
        next = maxLeft;
        this.#autoDir = -1;
      } else if (next <= 0) {
        next = 0;
        this.#autoDir = 1;
      }
      this.#track.scrollLeft = next;
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
    const wrap = this.#root.querySelector(".wrap")!;

    this.#track.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#track.addEventListener(
      "wheel",
      () => this.#pauseForUser(),
      { passive: true },
    );
    this.#track.addEventListener(
      "touchstart",
      () => this.#pauseForUser(),
      { passive: true },
    );
    this.#track.addEventListener("pointerdown", this.#onPointerDown);
    this.#track.addEventListener("pointermove", this.#onPointerMove);
    this.#track.addEventListener("pointerup", this.#onPointerUp);
    this.#track.addEventListener("pointercancel", this.#onPointerUp);
    this.#track.addEventListener("dragstart", (event) => event.preventDefault());

    wrap.addEventListener("pointerenter", () => {
      this.#hoverPaused = true;
      this.#syncAutoPause();
    });
    wrap.addEventListener("pointerleave", () => {
      this.#hoverPaused = false;
      this.#syncAutoPause();
    });

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

    this.#updateChrome();
  }

  #createSlide(item: CarouselMediaItem, index: number) {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.dataset.slide = String(index);
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const frame = document.createElement("div");
    frame.className = "frame";

    if (isVideo(item)) {
      const video = document.createElement("video");
      video.className = "media";
      video.playsInline = true;
      video.muted = true;
      video.loop = true;
      video.preload = "auto";
      video.setAttribute("aria-label", item.alt);
      video.controls = index === 0;
      video.src = item.src;

      const markLoaded = () => video.classList.add("is-loaded");
      video.addEventListener("loadeddata", markLoaded);
      video.addEventListener("canplay", markLoaded);
      video.addEventListener("playing", markLoaded);
      video.addEventListener("error", markLoaded);
      // Kick decode so off-center slides aren't stuck invisible (opacity 0).
      void video.play().then(markLoaded).catch(() => undefined);
      if (video.readyState >= 2) markLoaded();
      frame.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "media";
      img.decoding = "async";
      img.loading = "eager";
      img.alt = item.alt;
      img.src = item.src;
      const markLoaded = () => img.classList.add("is-loaded");
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markLoaded);
      if (img.complete) markLoaded();
      void img.decode?.().then(markLoaded).catch(markLoaded);
      frame.appendChild(img);
    }

    slide.appendChild(frame);

    slide.addEventListener("mouseenter", () => this.#onSlideHover(index));
    slide.addEventListener("mouseleave", () => this.#onSlideLeave());
    slide.addEventListener("click", (event) => {
      if (this.#suppressClick) {
        this.#suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.#pauseForUser();
      if (index !== this.#active) this.#goTo(index);
      this.#openItem(index);
    });

    return slide;
  }

  #openItem(index: number) {
    const item = this.#items[index];
    if (!item) return;
    this.dispatchEvent(
      new CustomEvent<GalleryOpenDetail>("ah-media-open", {
        bubbles: true,
        composed: true,
        detail: { ...item, index },
      }),
    );
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

  #centerSlide(index: number, animated: boolean) {
    const slide = this.#track.querySelector<HTMLElement>(
      `[data-slide="${index}"]`,
    );
    if (!slide) return;
    const targetLeft = this.#slideScrollLeft(slide);
    if (animated && !this.#reduced) {
      this.#animateScrollTo(targetLeft, 980);
    } else {
      this.#track.scrollLeft = Math.max(
        0,
        Math.min(
          Math.max(0, this.#track.scrollWidth - this.#track.clientWidth),
          targetLeft,
        ),
      );
    }
  }

  #syncFocus(now = performance.now()) {
    const slides = Array.from(
      this.#track.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    if (!slides.length) return;

    const dt = Math.min(48, now - (this.#lastMotionNow || now));
    this.#lastMotionNow = now;

    const trackRect = this.#track.getBoundingClientRect();
    const rootMid = trackRect.left + trackRect.width / 2;
    const falloff = Math.max(trackRect.width * 0.42, 1);

    let best = 0;
    let bestAmount = -1;

    slides.forEach((slide, index) => {
      const mid =
        trackRect.left +
        (slide.offsetLeft - this.#track.scrollLeft) +
        slide.offsetWidth / 2;
      const dist = Math.abs(mid - rootMid);
      const amount = Math.max(0, Math.min(1, 1 - dist / falloff));
      const focus = 1 - (1 - amount) * (1 - amount);

      const scale = SCALE_MIN + focus * (SCALE_MAX - SCALE_MIN);
      const opacity = OPACITY_MIN + focus * (OPACITY_MAX - OPACITY_MIN);
      const blur = BLUR_MAX * (1 - focus);
      const pose = `scale(${scale.toFixed(4)})`;
      slide.style.transformOrigin = "50% 50%";
      slide.style.transformStyle = "preserve-3d";
      if (this.#reduced || !this.#isDesktop()) {
        slide.style.transform = pose;
      } else {
        const pull = stepMousePull(
          this.#pullFor(slide),
          slide,
          now,
          dt,
          "gallery",
          0.5,
        );
        slide.style.transform = withIdleHover(pose, {
          x: pull.x,
          y: pull.y,
          z: pull.z,
          rot: 0,
          rotX: pull.rotX,
          rotY: pull.rotY,
        });
      }
      slide.style.opacity = String(opacity);
      slide.style.filter = `blur(${blur.toFixed(2)}px)`;

      if (amount > bestAmount) {
        bestAmount = amount;
        best = index;
      }
    });

    slides.forEach((slide, index) => {
      slide.style.zIndex = index === best ? "2" : "1";
    });

    if (best !== this.#active) {
      this.#active = best;
      this.#targetIndex = best;
      this.#updateChrome();
      this.#syncPlayback();
    }
  }

  #syncPlayback() {
    const slides = this.#track.querySelectorAll<HTMLElement>("[data-slide]");
    slides.forEach((slide, index) => {
      const video = slide.querySelector("video");
      const active = index === this.#active;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (!video) return;
      video.controls = active;
      if (active && !this.#lightboxOpen) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
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

  #animateScrollTo(targetLeft: number, duration: number) {
    if (this.#scrollRaf) window.cancelAnimationFrame(this.#scrollRaf);

    const maxLeft = Math.max(
      0,
      this.#track.scrollWidth - this.#track.clientWidth,
    );
    const end = Math.max(0, Math.min(maxLeft, targetLeft));
    const start = this.#track.scrollLeft;
    const delta = end - start;
    if (Math.abs(delta) < 0.5) return;

    const startTime = performance.now();
    this.#syncAutoPause();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      this.#track.scrollLeft = start + delta * easeInOutCubic(t);
      this.#syncFocus();
      if (t < 1) {
        this.#scrollRaf = window.requestAnimationFrame(step);
      } else {
        this.#track.scrollLeft = end;
        this.#scrollRaf = null;
        this.#syncFocus();
        this.#syncAutoPause();
      }
    };
    this.#scrollRaf = window.requestAnimationFrame(step);
  }

  #goTo(index: number) {
    if (!this.#items.length) return;
    const clamped = Math.max(0, Math.min(this.#items.length - 1, index));
    if (clamped === this.#targetIndex && Math.abs(this.#active - clamped) < 1) {
      return;
    }

    this.#targetIndex = clamped;
    this.#centerSlide(clamped, true);
  }

  #onSlideHover(index: number) {
    if (this.#reduced || this.#dragging) return;
    if (this.#hoverTimer) window.clearTimeout(this.#hoverTimer);
    this.#hoverTimer = window.setTimeout(() => {
      if (this.#dragging || index === this.#targetIndex) return;
      this.#goTo(index);
    }, 240);
  }

  #onSlideLeave() {
    if (this.#hoverTimer) {
      window.clearTimeout(this.#hoverTimer);
      this.#hoverTimer = null;
    }
  }
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
    "ah-media-gallery-v10": AhMediaCarousel;
  }
}

export function defineAhMediaCarousel() {
  if (
    typeof window !== "undefined" &&
    !customElements.get("ah-media-gallery-v10")
  ) {
    customElements.define("ah-media-gallery-v10", AhMediaCarousel);
  }
}
