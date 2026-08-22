"use client";

import { useEffect, useRef, useState } from "react";
import {
  viewHeight,
  viewLeft,
  viewTop,
  viewWidth,
} from "@/lib/loadClear";

/**
 * Full-bleed velvet field + a single large spotlight that drifts
 * slightly with scroll (reads like a soft stage light on nap fabric).
 */
export function AmbientOrbs() {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const el = spotRef.current;
    if (!root || !el) return;

    let frame = 0;
    let smoothT = 0;
    let hasT = false;

    const pinToVisual = () => {
      root.style.left = `${viewLeft()}px`;
      root.style.top = `${viewTop()}px`;
      root.style.width = `${viewWidth()}px`;
      root.style.height = `${viewHeight()}px`;
      root.style.right = "auto";
      root.style.bottom = "auto";
    };

    const scrollT = () => {
      const viewH = viewHeight();
      const pageTop =
        window.visualViewport?.pageTop ??
        window.scrollY ??
        window.pageYOffset ??
        0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - viewH,
      );
      return Math.min(1, Math.max(0, pageTop / maxScroll));
    };

    const paintSpot = (t: number) => {
      if (reduced) {
        el.style.transform = "translate(-50%, -50%) translate(0, -4%)";
        return;
      }
      const x = Math.sin(t * Math.PI * 1.6) * 5.5;
      const y = -6 + t * 14;
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}%, ${y.toFixed(2)}%)`;
    };

    const update = () => {
      frame = 0;
      pinToVisual();
      const next = scrollT();
      if (!hasT) {
        smoothT = next;
        hasT = true;
      } else {
        smoothT += (next - smoothT) * 0.18;
      }
      paintSpot(smoothT);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="site-atmosphere pointer-events-none fixed z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="velvet-field" />
      <div className="velvet-nap" />
      <span ref={spotRef} className="spotlight" />
    </div>
  );
}
