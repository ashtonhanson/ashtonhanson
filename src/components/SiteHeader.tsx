"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { navLinks } from "@/lib/content";
import {
  composeIdleTransform,
  createIdleHoverState,
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

/** Same idle + mouse-pull used by titles and copy, scoped to one menu item. */
function NavHover({
  children,
  seed,
  className = "",
}: {
  children: ReactNode;
  seed: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pull = createMousePullState();
    const idle = createIdleHoverState();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastNow = performance.now();
    let frame = 0;

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastNow);
      lastNow = now;
      if (document.hidden) return;
      if (reduce.matches) {
        el.style.transform = "none";
        return;
      }
      const pulled = stepMousePull(pull, el, now, dt, "title");
      el.style.transformStyle = "preserve-3d";
      el.style.transform = composeIdleTransform(
        idle,
        "none",
        now,
        dt,
        seed,
        true,
        0,
        1.75,
        pulled,
      );
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [seed]);

  return (
    <span
      ref={ref}
      className={`relative inline-block [transform-style:preserve-3d] ${className}`.trim()}
    >
      {children}
    </span>
  );
}

function NavGlowLink({
  href,
  label,
  active,
  seed,
  className = "",
  style,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  seed: number;
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
      <NavHover seed={seed}>
        <span className="nav-glow-base">{label}</span>
        <span aria-hidden className="nav-glow-live">
          {label}
        </span>
      </NavHover>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--site-header-frost-height",
        `${Math.ceil(header.getBoundingClientRect().height)}px`,
      );
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(
        "--site-header-frost-height",
      );
    };
  }, [open]);

  return (
    <div className="site-header-shell pointer-events-auto">
      <header className="site-header border-b border-line">
      <div className="site-header-row mx-auto flex max-w-6xl items-center px-5 py-3 md:px-8 xl:max-w-7xl xl:px-12 2xl:px-16">
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
          <NavHover seed={2}>
            <AhMark />
          </NavHover>
        </Link>

        <nav className="site-nav-desktop" aria-label="Primary">
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
                seed={index + 5}
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
          className={`nav-burger ${open ? "is-open" : ""}`.trim()}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <NavHover seed={1}>
            <span className="nav-burger-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </NavHover>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="site-header-panel border-t border-line px-5 py-4"
          aria-label="Mobile"
        >
          <ul className="flex flex-col items-end gap-4">
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
                    seed={index + 12}
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
    </div>
  );
}
