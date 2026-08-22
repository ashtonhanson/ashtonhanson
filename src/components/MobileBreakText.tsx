import { Fragment, type ReactNode } from "react";

/**
 * Renders subtitle text with optional soft breaks (`\n`).
 * By default breaks show on mobile only; desktop joins lines with a normal space.
 */
export function MobileBreakText({
  text,
  alwaysBreak = false,
}: {
  text: string;
  alwaysBreak?: boolean;
}): ReactNode {
  const lines = text.split("\n");
  if (lines.length < 2) return text;

  return lines.map((line, index) => (
    <Fragment key={`${index}-${line}`}>
      {index > 0 ? (
        alwaysBreak ? (
          <br />
        ) : (
          <>
            <br className="md:hidden" />
            <span className="hidden md:inline"> </span>
          </>
        )
      ) : null}
      {line}
    </Fragment>
  ));
}
