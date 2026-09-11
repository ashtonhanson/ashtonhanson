"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SkyClouds } from "@/components/SkyClouds";

const experimentNav = [
  { href: "/", label: "HOME" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
  { href: "/contact", label: "CONTACT" },
] as const;

const BURGER_FLIP_MS = 720;
const BURGER_GLYPH_SWAP_MS = 430;

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ExperimentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [glyph, setGlyph] = useState<"A" | "H">("A");
  const flipTimers = useRef<number[]>([]);

  useEffect(() => {
    document.documentElement.classList.add("is-logo-study");
    return () => {
      document.documentElement.classList.remove("is-logo-study");
    };
  }, []);

  useEffect(() => {
    flipTimers.current.forEach((id) => window.clearTimeout(id));
    flipTimers.current = [];
    setOpen(false);
    setFlipping(false);
    setGlyph("A");
  }, [pathname]);

  useEffect(() => {
    return () => {
      flipTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const toggleMenu = () => {
    if (flipping) return;
    const nextOpen = !open;
    setFlipping(true);
    setOpen(nextOpen);
    flipTimers.current.forEach((id) => window.clearTimeout(id));
    const swapId = window.setTimeout(() => {
      setGlyph(nextOpen ? "H" : "A");
    }, BURGER_GLYPH_SWAP_MS);
    const endId = window.setTimeout(() => {
      setFlipping(false);
      flipTimers.current = [];
    }, BURGER_FLIP_MS);
    flipTimers.current = [swapId, endId];
  };

  return (
    <div className="experiment-root">
      <div className="experiment-sky" aria-hidden="true">
        <SkyClouds />
        <span className="experiment-sky-vignette" />
      </div>
      <div className="experiment-chrome">
        <header className="experiment-header">
          <Link
            href="/"
            className="experiment-logo"
            aria-label="Ashton Hanson Design home"
            onClick={() => setOpen(false)}
          >
            {/* Mark arrow, upright — reads as an A */}
            <svg
              className="experiment-logo-mark"
              viewBox="48 44 176 182"
              width={38}
              height={40}
              aria-hidden="true"
            >
              <path
                d="M130.3,48.8L48.9,217.3c-3.9,6.2,5.5,12.9,12.3,7.8l70.9-52.2c2.2-1.5,5.2-1.5,7.4,0l70.9,52.2c6.8,5.2,16-2.3,13.2-7.4l-82.3-169C139.3,44.3,132.5,44.3,130.3,48.8z"
                fill="currentColor"
              />
            </svg>
          </Link>
          <nav className="experiment-nav" aria-label="Primary">
            {experimentNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href, pathname) ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className={`experiment-burger${open ? " is-open" : ""}${flipping ? " is-flipping" : ""}`}
            aria-expanded={open}
            aria-controls="experiment-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className="experiment-burger-glyph" aria-hidden="true">
              {glyph}
            </span>
          </button>
        </header>
        {open ? (
          <nav
            id="experiment-mobile-nav"
            className="experiment-nav-mobile"
            aria-label="Primary"
          >
            {experimentNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href, pathname) ? "is-active" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      {children}
    </div>
  );
}
