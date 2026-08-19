"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed velvet field + a single large spotlight that drifts
 * slightly with scroll (reads like a soft stage light on nap fabric).
 */
export function AmbientOrbs() {
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
    const el = spotRef.current;
    if (!el) return;

    if (reduced) {
      el.style.transform = "translate(-50%, -50%) translate(0, -4vh)";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const t = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const x = Math.sin(t * Math.PI * 1.6) * 5.5;
      const y = -6 + t * 14;
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}vw, ${y.toFixed(2)}vh)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      className="site-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="velvet-field" />
      <div className="velvet-nap" />
      <span ref={spotRef} className="spotlight" />
    </div>
  );
}
