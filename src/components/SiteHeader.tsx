"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { navLinks } from "@/lib/content";
import {
  createIdleHoverState,
  idleHoverOffset,
  stepIdleBlend,
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
      data-nav-pull="1"
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
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
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
        el.style.transformStyle = "preserve-3d";
        if (mq.matches) {
          el.style.transform = "none";
          return;
        }
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
        const blend = stepIdleBlend(idle, true, now, dt);
        const float = idleHoverOffset(blend, now, index + 4, 1.7);
        const x = (float.x + pulled.x) * 42;
        const y = (float.y + pulled.y) * 32;
        const z = float.z * 2 + pulled.z;
        const rotX = float.rotX + pulled.rotX;
        const rotY = float.rotY + pulled.rotY;
        const rot = float.rot;
        const scale = 1 + Math.min(0.12, z / 260);
        el.style.transform = `perspective(720px) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      });
    };

    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <header
      ref={rootRef}
      className="site-header border-b border-line"
    >
      <div className="site-header-frost" aria-hidden="true" />
      <div className="site-header-row mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8 xl:max-w-7xl xl:px-12 2xl:px-16">
        <Link
          href="/"
          data-nav-pull="1"
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
          data-nav-pull="1"
          className={`nav-burger md:hidden ${open ? "is-open" : ""}`.trim()}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-burger-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="site-header-panel border-t border-line px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <div className="site-header-panel-frost" aria-hidden="true" />
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
