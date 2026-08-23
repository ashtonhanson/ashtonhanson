"use client";

import { useLayoutEffect } from "react";

const PREFIX = "ah-scroll:";

type SavedScroll = {
  y: number;
  height: number;
};

function pathKey() {
  return PREFIX + window.location.pathname;
}

function read(): SavedScroll | null {
  try {
    const raw = sessionStorage.getItem(pathKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedScroll;
    if (typeof parsed?.y !== "number" || parsed.y < 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write() {
  try {
    sessionStorage.setItem(
      pathKey(),
      JSON.stringify({
        y: window.scrollY,
        height: document.documentElement.scrollHeight,
      }),
    );
  } catch {
    /* private mode / quota */
  }
}

function isReloadOrBack() {
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === "reload" || entry?.type === "back_forward";
}

/**
 * Native scroll restoration runs before the cinematic pins have height,
 * so a refresh on the gallery lands at the top. Save per-path offset and
 * reapply once the document is tall enough.
 */
export function ScrollRestore() {
  useLayoutEffect(() => {
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }

    let frames = 0;
    let restoreRaf = 0;
    let saveRaf = 0;
    const saved = isReloadOrBack() ? read() : null;

    const apply = () => {
      if (!saved) return;
      const height = document.documentElement.scrollHeight;
      const max = Math.max(0, height - window.innerHeight);
      const ready =
        height >= saved.height * 0.85 || max >= saved.y - 8 || frames > 36;
      if (ready) {
        window.scrollTo(0, Math.min(saved.y, max));
      }
      frames += 1;
      if (!ready || frames < 12) {
        restoreRaf = window.requestAnimationFrame(apply);
      }
    };

    if (saved) apply();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      saveRaf = window.requestAnimationFrame(() => {
        ticking = false;
        write();
      });
    };
    const onHide = () => write();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") write();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.cancelAnimationFrame(restoreRaf);
      window.cancelAnimationFrame(saveRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
