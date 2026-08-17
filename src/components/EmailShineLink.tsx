"use client";

import { useEffect, useState } from "react";

type ShineDir = "ltr" | "rtl";
type ShineMode = ShineDir | `${ShineDir}-return`;

/** Mailto link with occasional random horizontal shine passes. */
export function EmailShineLink({ email }: { email: string }) {
  const label = email.toUpperCase();
  const [shining, setShining] = useState(false);
  const [mode, setMode] = useState<ShineMode>("ltr");
  const [nextDir, setNextDir] = useState<ShineDir>("ltr");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || shining) return;

    // Idle gap between passes — roughly every ~30s, with a little randomness
    const wait = 25000 + Math.random() * 10000;
    const id = window.setTimeout(() => {
      // Sometimes go one way and immediately return the other way
      const roundTrip = Math.random() < 0.4;
      setMode(roundTrip ? `${nextDir}-return` : nextDir);
      setShining(true);
    }, wait);
    return () => window.clearTimeout(id);
  }, [reduced, shining, nextDir]);

  return (
    <a
      href={`mailto:${email}`}
      className={`email-shine mt-10 inline-block font-display text-[0.85rem] font-medium tracking-[0.18em] text-ink transition-opacity hover:opacity-70${
        shining ? ` is-shining shine-${mode}` : ""
      }`}
    >
      <span className="email-shine-label">{label}</span>
      <span
        aria-hidden
        className="email-shine-glint"
        onAnimationEnd={() => {
          setShining(false);
          setNextDir((prev) => (prev === "ltr" ? "rtl" : "ltr"));
        }}
      >
        {label}
      </span>
    </a>
  );
}
