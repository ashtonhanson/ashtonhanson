"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { navLinks } from "@/lib/content";

function AhMark() {
  return (
    <>
      <span className="nav-glow-base">AH</span>
      <span aria-hidden className="nav-glow-live">
        AH
      </span>
    </>
  );
}

function NavGlowLink({
  href,
  label,
  active,
  className = "",
  style,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`nav-glow ${active ? "is-active" : ""} ${className}`.trim()}
      style={style}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <span className="nav-glow-base">{label}</span>
      <span aria-hidden className="nav-glow-live">
        {label}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-nav/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8 xl:max-w-7xl xl:px-12 2xl:px-16">
        <Link
          href="/"
          className="nav-glow is-active shrink-0 text-[1.45rem] font-semibold leading-none tracking-[0.06em]"
          style={
            {
              "--nav-glow-delay": "0.2s",
              "--nav-glow-duration": "10.5s",
              "--nav-glow-pulse": "6.2s",
            } as CSSProperties
          }
          aria-label="Ashton Hanson Design home"
          onClick={() => setOpen(false)}
        >
          <AhMark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navLinks.map((link, index) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <NavGlowLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={active}
                className="text-[0.78rem]"
                style={
                  {
                    "--nav-glow-delay": `${index * 0.85}s`,
                    "--nav-glow-duration": `${8.2 + (index % 3) * 1.4}s`,
                    "--nav-glow-pulse": `${4.8 + (index % 4) * 0.7}s`,
                  } as CSSProperties
                }
              />
            );
          })}
        </nav>

        <button
          type="button"
          className="font-display text-[0.72rem] tracking-[0.18em] text-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-nav px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-4">
            {navLinks.map((link, index) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <NavGlowLink
                    href={link.href}
                    label={link.label}
                    active={active}
                    className="text-[0.85rem]"
                    style={
                      {
                        "--nav-glow-delay": `${index * 0.85}s`,
                        "--nav-glow-duration": `${8.2 + (index % 3) * 1.4}s`,
                        "--nav-glow-pulse": `${4.8 + (index % 4) * 0.7}s`,
                      } as CSSProperties
                    }
                    onClick={() => setOpen(false)}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
