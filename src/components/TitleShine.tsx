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
        className={`title-shine ${className}`.trim()}
        style={style}
      >
        <span className="title-shine-fill">{children}</span>
        {label ? (
          <span aria-hidden className="title-shine-beam">
            {label}
          </span>
        ) : null}
      </Tag>
    );
  },
);
