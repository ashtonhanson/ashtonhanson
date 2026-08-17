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

/** Solid title with an extremely thin shiny outline. */
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
