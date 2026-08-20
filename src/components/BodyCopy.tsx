"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { withIdleHover } from "@/lib/idleHover";
import { createMousePullState, mousePullIsResting, stepMousePull } from "@/lib/mousePull";
import { preventOrphan } from "@/lib/text";

type BodyCopyProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Body paragraph with scroll-linked fade + blur
 * as it nears the top or bottom of the viewport.
 */
export function BodyCopy({ children, className = "" }: BodyCopyProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const edgeRef = useRef(1);
  const [edge, setEdge] = useState(1);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      edgeRef.current = 1;
      setEdge(1);
      const el = ref.current;
      if (el) el.style.transform = "none";
      return;
    }

    let frame = 0;
    let lastNow = performance.now();
    const pull = createMousePullState();

    const updateEdge = () => {
      const el = ref.current;
      if (!el) return;

      const viewH = window.innerHeight || 1;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distFromEdge = Math.min(center, viewH - center);
      const fadeZone = viewH * 0.32;
      const next = Math.max(0, Math.min(1, distFromEdge / fadeZone));

      if (Math.abs(next - edgeRef.current) < 0.008) return;
      edgeRef.current = next;
      setEdge(next);
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const el = ref.current;
      if (!el) return;
      const pulled = stepMousePull(pull, el, now, dt, "body");
      el.style.transformStyle = "preserve-3d";
      el.style.transform = mousePullIsResting(pulled)
        ? "none"
        : withIdleHover("none", {
            x: pulled.x,
            y: pulled.y,
            z: pulled.z,
            rot: 0,
            rotX: pulled.rotX,
            rotY: pulled.rotY,
          });
    };

    const onScroll = () => {
      updateEdge();
    };

    updateEdge();
    frame = window.requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const fade = 1 - edge;
  const blur = reduced ? 0 : fade * fade * 10;
  const opacity = reduced ? 1 : 0.18 + edge * edge * 0.82;

  return (
    <p
      ref={ref}
      className={`body-copy [text-wrap:pretty] ${className}`.trim()}
      style={{
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity,
        willChange: reduced ? undefined : "filter, opacity, transform",
        transition: "filter 100ms linear, opacity 100ms linear",
      }}
    >
      {typeof children === "string" ? preventOrphan(children) : children}
    </p>
  );
}
