"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SkyClouds } from "@/components/SkyClouds";

const experimentNav = [
  { href: "/", label: "HOME" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
  { href: "/contact", label: "CONTACT" },
] as const;

const MENU_ID = "experiment-mobile-nav";
const DESKTOP_QUERY = "(min-width: 768px)";
/** Finalized AH / bow-tie mark — transparent SVG supplied by Ashton. */
const BRAND_LOGO_SRC = "/AH%20logo/AH%20logo-01.svg";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ExperimentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Remember which route opened the menu — navigating anywhere closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);

  /** Single source of truth for the menu — every open/close goes through here. */
  const setMenuOpen = useCallback(
    (next: boolean, { restoreFocus = false } = {}) => {
      setOpenPath(next ? pathname : null);
      if (restoreFocus) toggleRef.current?.focus();
    },
    [pathname],
  );

  useEffect(() => {
    document.documentElement.classList.add("is-logo-study");
    return () => {
      document.documentElement.classList.remove("is-logo-study");
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false, { restoreFocus: true });
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open, setMenuOpen]);

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
            className="experiment-brand"
            aria-label="Ashton Hanson — Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG keeps its own transparency */}
            <img
              className="experiment-brand-mark"
              src={BRAND_LOGO_SRC}
              alt=""
              width={269}
              height={283}
              decoding="async"
            />
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
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-controls={MENU_ID}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!open)}
          >
            <span className="menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </header>
        <nav
          id={MENU_ID}
          className={`experiment-nav-mobile${open ? " is-open" : ""}`}
          aria-label="Primary"
          hidden={!open}
          inert={!open}
        >
          {experimentNav.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href, pathname) ? "is-active" : undefined}
              style={{ "--nav-i": index } as CSSProperties}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
