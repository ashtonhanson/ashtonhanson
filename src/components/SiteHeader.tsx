"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { navLinks } from "@/lib/content";
import {
  composeIdleTransform,
  createIdleHoverState,
  type IdleHoverState,
} from "@/lib/idleHover";
import { createMousePullState, stepMousePull } from "@/lib/mousePull";

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
      <span data-nav-pull="" className="relative inline-block [transform-style:preserve-3d]">
        <span className="nav-glow-base">{label}</span>
        <span aria-hidden className="nav-glow-live">
          {label}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const pulls = new WeakMap<
      HTMLElement,
      ReturnType<typeof createMousePullState>
    >();
    const idles = new WeakMap<HTMLElement, IdleHoverState>();
    let lastNow = performance.now();
    let frame = 0;

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      const root = rootRef.current;
      if (!root) return;
      root.querySelectorAll<HTMLElement>("[data-nav-pull]").forEach((el, index) => {
        let pull = pulls.get(el);
        if (!pull) {
          pull = createMousePullState();
          pulls.set(el, pull);
        }
        let idle = idles.get(el);
        if (!idle) {
          idle = createIdleHoverState();
          idles.set(el, idle);
        }
        const pulled = stepMousePull(pull, el, now, dt, "title");
        el.style.transformStyle = "preserve-3d";
        el.style.transform = composeIdleTransform(
          idle,
          "none",
          now,
          dt,
          index + 3,
          true,
          0,
          1.55,
          pulled,
        );
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <header
      ref={rootRef}
      className="site-header sticky top-0 z-50 border-b border-line"
    >
      <div className="site-header-row mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8 xl:max-w-7xl xl:px-12 2xl:px-16">
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
          <span data-nav-pull="" className="relative inline-block [transform-style:preserve-3d]">
            <AhMark />
          </span>
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
          className={`nav-burger md:hidden ${open ? "is-open" : ""}`.trim()}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span data-nav-pull="" className="relative inline-block [transform-style:preserve-3d]">
            <span className="nav-burger-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="site-header-panel border-t border-line px-5 py-4 md:hidden"
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
