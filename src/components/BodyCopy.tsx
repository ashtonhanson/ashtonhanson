"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type BodyCopyProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Keep the final line from orphaning a single word by breaking
 * before the second-to-last word on the last paragraph line.
 */
function pairLastTwoWords(text: string): string {
  const lines = text.split("\n");
  const lastIndex = lines.length - 1;
  const last = lines[lastIndex] ?? "";
  const parts = last.split(/(\s+)/);
  const wordIndexes = parts
    .map((part, index) => (/\S/.test(part) ? index : -1))
    .filter((index) => index >= 0);

  if (wordIndexes.length < 2) return text;

  const secondLast = wordIndexes[wordIndexes.length - 2]!;
  const wsIndex = secondLast - 1;
  if (wsIndex >= 0 && /^\s+$/.test(parts[wsIndex] ?? "")) {
    parts[wsIndex] = "\n";
  }

  lines[lastIndex] = parts.join("");
  return lines.join("\n");
}

/**
 * Body paragraph with horizontal edge mask, plus scroll-linked
 * fade + blur as it nears the top or bottom of the viewport.
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
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const viewH = window.innerHeight || 1;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distFromEdge = Math.min(center, viewH - center);
      // Fully clear once past ~32% of the viewport from either edge
      const fadeZone = viewH * 0.32;
      const next = Math.max(0, Math.min(1, distFromEdge / fadeZone));

      if (Math.abs(next - edgeRef.current) < 0.008) return;
      edgeRef.current = next;
      setEdge(next);
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

  // edge 1 = mid-screen (clear); edge 0 = at top/bottom (faded + blurred)
  const fade = 1 - edge;
  const blur = reduced ? 0 : fade * fade * 10;
  // Don't go fully invisible — leave a soft floor near the edges
  const opacity = reduced ? 1 : 0.18 + edge * edge * 0.82;

  const content =
    typeof children === "string" ? pairLastTwoWords(children) : children;

  return (
    <p
      ref={ref}
      className={`body-copy whitespace-pre-line ${className}`.trim()}
      style={{
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity,
        willChange: reduced ? undefined : "filter, opacity",
        transition: "filter 100ms linear, opacity 100ms linear",
      }}
    >
      {content}
    </p>
  );
}
