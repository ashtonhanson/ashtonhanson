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

/** Title with a metallic shine traveling through the letter fill. */
export const TitleShine = forwardRef<HTMLElement, TitleShineProps>(
  function TitleShine(
    { as: Tag = "span", className = "", children, style },
    ref,
  ) {
    return (
      <Tag
        ref={ref}
        className={`title-shine ${className}`.trim()}
        style={style}
      >
        <span className="title-shine-fill">{children}</span>
      </Tag>
    );
  },
);
