"use client";

import { useLayoutEffect } from "react";

/**
 * Cinematic pins make native restoration land mid-page after a refresh.
 * Always start at the top on load / reload.
 */
export function ScrollRestore() {
  useLayoutEffect(() => {
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }

    const toTop = () => window.scrollTo(0, 0);
    toTop();
    const timeout = window.setTimeout(toTop, 0);
    const raf = window.requestAnimationFrame(toTop);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
