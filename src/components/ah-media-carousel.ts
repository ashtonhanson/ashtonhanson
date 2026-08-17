export type CarouselMediaItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

const SCALE_MIN = 0.9;
const SCALE_MAX = 1.08;
const OPACITY_MIN = 0.5;
const OPACITY_MAX = 1;
const BLUR_MAX = 4; // px — fully off-focus slides
const BLUR_MIN = 0;

const STYLES = /* css */ `
:host {
  display: block;
  width: 100%;
  color: #d2d2d2;
  font-family: var(--font-display, "Montserrat", system-ui, sans-serif);
}

* {
  box-sizing: border-box;
}

.wrap {
  width: 100%;
}

.track {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 2rem 12%;
  scroll-behavior: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.track::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .track {
    gap: 1rem;
    padding: 2.5rem 18%;
  }
}

.slide {
  position: relative;
  z-index: 1;
  width: 76%;
  max-width: 42rem;
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid #1f1f20;
  background: #080809;
  will-change: transform, opacity, filter;
}

@media (min-width: 768px) {
  .slide {
    width: 68%;
  }
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #080809;
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
  opacity: 0;
  transition: opacity 180ms ease;
}

.media.is-loaded {
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

/**
 * Native web component: AI / media gallery with hover-to-focus glide
 * and continuous magnification states.
 */
export class AhMediaCarousel extends HTMLElement {
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
  #mq: MediaQueryList | null = null;
  #root!: ShadowRoot;
  #track!: HTMLDivElement;
  #dots!: HTMLDivElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;

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
    this.#render();
    this.#scheduleFocus(true);
  }

  connectedCallback() {
    this.#mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.#reduced = this.#mq.matches;
    this.#mq.addEventListener("change", this.#onReducedChange);
    window.addEventListener("resize", this.#onResize);
    this.#render();
    this.#scheduleFocus(true);
  }

  disconnectedCallback() {
    this.#mq?.removeEventListener("change", this.#onReducedChange);
    window.removeEventListener("resize", this.#onResize);
    this.#track?.removeEventListener("scroll", this.#onScroll);
    if (this.#hoverTimer) window.clearTimeout(this.#hoverTimer);
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

  #render() {
    const label = this.#label();

    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <div class="wrap" data-region role="region" aria-roledescription="carousel" aria-label="${escapeAttr(label)}">
        <div class="track" part="track"></div>
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
    this.#prevBtn.addEventListener("click", () =>
      this.#goTo(Math.max(0, this.#active - 1)),
    );
    this.#nextBtn.addEventListener("click", () =>
      this.#goTo(Math.min(this.#items.length - 1, this.#active + 1)),
    );

    this.#track.innerHTML = "";
    this.#dots.innerHTML = "";

    this.#items.forEach((item, index) => {
      this.#track.appendChild(this.#createSlide(item, index));
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => this.#goTo(index));
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
      video.preload = "metadata";
      video.setAttribute("aria-label", item.alt);
      video.controls = index === 0;
      const source = document.createElement("source");
      source.src = item.src;
      video.appendChild(source);
      const markLoaded = () => video.classList.add("is-loaded");
      video.addEventListener("loadeddata", markLoaded);
      if (video.readyState >= 2) markLoaded();
      frame.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "media";
      img.src = item.src;
      img.alt = item.alt;
      const markLoaded = () => img.classList.add("is-loaded");
      img.addEventListener("load", markLoaded);
      if (img.complete && img.naturalWidth > 0) markLoaded();
      frame.appendChild(img);
    }

    slide.appendChild(frame);

    slide.addEventListener("mouseenter", () => this.#onSlideHover(index));
    slide.addEventListener("mouseleave", () => this.#onSlideLeave());
    slide.addEventListener("click", () => {
      if (index !== this.#active) this.#goTo(index);
    });

    return slide;
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

  #syncFocus() {
    const slides = Array.from(
      this.#track.querySelectorAll<HTMLElement>("[data-slide]"),
    );
    if (!slides.length) return;

    const trackRect = this.#track.getBoundingClientRect();
    const rootMid = trackRect.left + trackRect.width / 2;
    const falloff = Math.max(trackRect.width * 0.42, 1);

    let best = 0;
    let bestAmount = -1;

    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(mid - rootMid);
      const amount = Math.max(0, Math.min(1, 1 - dist / falloff));
      // Ease so near-center stays clear, and leaving focus softens gradually
      // instead of dropping off a cliff.
      const focus = 1 - (1 - amount) * (1 - amount);

      const scale = SCALE_MIN + focus * (SCALE_MAX - SCALE_MIN);
      const opacity = OPACITY_MIN + focus * (OPACITY_MAX - OPACITY_MIN);
      const blur = BLUR_MAX * (1 - focus);

      slide.style.transform = `scale(${scale.toFixed(4)})`;
      slide.style.opacity = String(opacity);
      // Keep filter applied (even at 0) to avoid a compositing snap.
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
      if (active) {
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
      }
    };
    this.#scrollRaf = window.requestAnimationFrame(step);
  }

  #goTo(index: number) {
    if (!this.#items.length) return;
    const clamped = Math.max(0, Math.min(this.#items.length - 1, index));
    if (clamped === this.#targetIndex) return;

    this.#targetIndex = clamped;
    this.#centerSlide(clamped, true);
  }

  #onSlideHover(index: number) {
    if (this.#reduced) return;
    if (this.#hoverTimer) window.clearTimeout(this.#hoverTimer);
    this.#hoverTimer = window.setTimeout(() => {
      if (index === this.#targetIndex) return;
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
    "ah-media-gallery-v4": AhMediaCarousel;
  }
}

/** Tag bumped so HMR re-registers after shadow-DOM behavior changes. */
export function defineAhMediaCarousel() {
  if (
    typeof window !== "undefined" &&
    !customElements.get("ah-media-gallery-v4")
  ) {
    customElements.define("ah-media-gallery-v4", AhMediaCarousel);
  }
}
