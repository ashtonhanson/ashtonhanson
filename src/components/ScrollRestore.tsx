"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Cinematic pins make native restoration land mid-page after a refresh
 * or client navigation. Always start at the top so the arrow can drop in.
 */
export function ScrollRestore() {
  const pathname = usePathname();

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
  }, [pathname]);

  return null;
}
