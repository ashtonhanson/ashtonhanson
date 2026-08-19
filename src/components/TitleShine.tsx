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
 * Velvet letter fill with a thin metallic edge shine + rim border.
 * Shine travels along the outline only — not through the interior.
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
      </Tag>
    );
  },
);
