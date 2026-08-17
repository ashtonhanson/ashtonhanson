"use client";

import type { CSSProperties } from "react";

/**
 * Large dual ambient orbs inspired by whatimado.com's orb theme —
 * soft radial glows that slowly drift across the viewport.
 */
export function AmbientOrbs() {
  const orbA = {
    "--orb-opacity": "0.48",
    "--orb-duration": "36s",
    "--orb-delay": "0s",
    "--orb-color": "#7a7a76",
  } as CSSProperties;

  const orbB = {
    "--orb-opacity": "0.38",
    "--orb-duration": "44s",
    "--orb-delay": "-14s",
    "--orb-color": "#656560",
  } as CSSProperties;

  return (
    <div
      className="ambient-orbs pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <span className="ambient-orb ambient-orb--a" style={orbA} />
      <span className="ambient-orb ambient-orb--b" style={orbB} />
    </div>
  );
}
