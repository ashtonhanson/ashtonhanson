import type { CSSProperties, ReactNode } from "react";

/** Filter target for intro layers — keep blur off the 3D / TitleShine parent. */
export function IntroBlur({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div data-intro-blur className="inline-block max-w-full" style={style}>
      {children}
    </div>
  );
}

export function applyIntroBlur(el: HTMLElement, blur: number) {
  const blurEl =
    (el.querySelector(":scope > [data-intro-blur]") as HTMLElement | null) ??
    el;
  if (blurEl !== el) el.style.filter = "none";
  blurEl.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
}
