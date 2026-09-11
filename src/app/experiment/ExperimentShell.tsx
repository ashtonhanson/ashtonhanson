"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SkyClouds } from "@/components/SkyClouds";

const experimentNav = [
  { href: "/", label: "HOME" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
  { href: "/contact", label: "CONTACT" },
] as const;

/** Upright mark arrow — reads as an A. */
const LOGO_ARROW_PATH =
  "M130.3,48.8L48.9,217.3c-3.9,6.2,5.5,12.9,12.3,7.8l70.9-52.2c2.2-1.5,5.2-1.5,7.4,0l70.9,52.2c6.8,5.2,16-2.3,13.2-7.4l-82.3-169C139.3,44.3,132.5,44.3,130.3,48.8z";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ExperimentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("is-logo-study");
    return () => {
      document.documentElement.classList.remove("is-logo-study");
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="experiment-root">
      <div className="experiment-sky" aria-hidden="true">
        <SkyClouds />
        <span className="experiment-sky-vignette" />
      </div>
      <div className="experiment-chrome">
        <header className="experiment-header">
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
            className={`experiment-burger${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="experiment-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg
              className="experiment-burger-mark"
              viewBox="48 44 176 182"
              aria-hidden="true"
            >
              <path
                className="experiment-burger-fill"
                d={LOGO_ARROW_PATH}
              />
              <path
                className="experiment-burger-outline"
                d={LOGO_ARROW_PATH}
                fill="none"
              />
            </svg>
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
