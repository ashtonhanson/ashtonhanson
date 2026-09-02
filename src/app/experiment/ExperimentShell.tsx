"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const experimentNav = [
  { href: "/", label: "HOME" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
  { href: "/contact", label: "CONTACT" },
] as const;

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
        <span className="experiment-cloud experiment-cloud-a">
          <span />
          <span />
          <span />
        </span>
        <span className="experiment-cloud experiment-cloud-b">
          <span />
          <span />
          <span />
        </span>
        <span className="experiment-cloud experiment-cloud-c">
          <span />
          <span />
          <span />
        </span>
        <span className="experiment-cloud experiment-cloud-d">
          <span />
          <span />
          <span />
        </span>
        <span className="experiment-cloud experiment-cloud-e">
          <span />
          <span />
        </span>
        <span className="experiment-cloud experiment-cloud-f">
          <span />
          <span />
        </span>
        <span className="experiment-sky-vignette" />
      </div>
      <header className="experiment-header">
        <Link
          href="/"
          className="experiment-logo"
          aria-label="Ashton Hanson Design home"
          onClick={() => setOpen(false)}
        >
          <img src="/experiment/ah-logo.svg" alt="" width={38} height={40} />
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
          className={`experiment-burger${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="experiment-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
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
      {children}
    </div>
  );
}
