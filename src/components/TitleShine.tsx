"use client";

import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type TitleShineProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * Title fill + FIXED viewport stage-light beam (no outline / no velvet texture).
 * Shine comes from a fixed beam — letters catch it as they scroll through.
 *
 * Glyphs are painted at 4× on their own 3D layer so CSS scale() toward camera
 * does not upsample a 1× bitmap. A hidden sizer keeps in-flow layout at the
 * authored type size (vector type still rasterizes once it’s transformed).
 */
export const TitleShine = forwardRef<HTMLElement, TitleShineProps>(
  function TitleShine(
    { as: Tag = "span", className = "", children, style },
    ref,
  ) {
    const label = typeof children === "string" ? children : undefined;

    return (
      <Tag
        ref={ref}
        data-text={label}
        aria-label={label}
        className={`title-shine ${className}`.trim()}
        style={style}
      >
        <span className="title-shine-sizer" aria-hidden>
          {children}
        </span>
        <span className="title-shine-paint" aria-hidden>
          <span className="title-shine-fill">{children}</span>
          {label ? (
            <span className="title-shine-beam">{label}</span>
          ) : null}
        </span>
      </Tag>
    );
  },
);
