"use client";

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import {
  SCROLL_LINE_INDICATOR_BOTTOM_CLASS,
  SCROLL_LINE_INDICATOR_MB_CLASS,
} from "@/lib/layoutSpacing";
import {
  SCROLL_LINE_DURATION_MS,
  SCROLL_LINE_INDICATOR_ROOT_GAP_CLASS,
  SCROLL_LINE_TRACK_CLASS,
  SCROLL_LINE_TRACK_LINE_CLASS,
  SCROLL_LINE_WHEEL_CLASS,
} from "@/lib/scrollLineIndicatorTokens";

export { SCROLL_LINE_INDICATOR_BOTTOM_CLASS, SCROLL_LINE_INDICATOR_MB_CLASS };
export {
  SCROLL_LINE_DURATION_MS,
  SCROLL_LINE_INDICATOR_CLICKABLE_CLASS,
  SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS,
  SCROLL_LINE_INDICATOR_ROOT_GAP_CLASS,
} from "@/lib/scrollLineIndicatorTokens";

export type ScrollLineIndicatorProps = {
  label?: string;
  labelPosition?: "above" | "below";
  /** @deprecated Caption removed */
  showCaption?: boolean;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  labelClassName?: string;
  durationMs?: number;
  onClick?: () => void;
  children?: ReactNode;
  floating?: boolean;
};

const customLabelClass =
  "font-manrope text-[11px] tracking-[0.28em] uppercase text-white/45 whitespace-nowrap text-center";

/**
 * Minimal scroll cue — vertical line + white dot loop (subtle, non-competing).
 */
export function ScrollLineIndicator({
  label,
  labelPosition = "below",
  className,
  trackClassName,
  barClassName,
  labelClassName,
  durationMs = SCROLL_LINE_DURATION_MS,
  onClick,
  children,
  floating = false,
}: ScrollLineIndicatorProps) {
  const cueStyle = {
    "--jade-scroll-line-duration": `${durationMs}ms`,
  } as CSSProperties;

  const hasCustomLabel = label != null || children != null;

  const customLabelEl = hasCustomLabel ? (
    <span className={clsx(customLabelClass, labelClassName)}>
      {label ?? children}
    </span>
  ) : null;

  const content = (
    <div className={SCROLL_LINE_INDICATOR_ROOT_GAP_CLASS} style={cueStyle}>
      {labelPosition === "above" && customLabelEl}
      <div
        className={clsx(SCROLL_LINE_TRACK_CLASS, trackClassName)}
        aria-hidden
      >
        <span className={SCROLL_LINE_TRACK_LINE_CLASS} />
        <div className={clsx(SCROLL_LINE_WHEEL_CLASS, barClassName)} />
      </div>
      {labelPosition === "below" && customLabelEl}
    </div>
  );

  const rootClass = clsx(
    "jade-scroll-cue inline-flex flex-col items-center justify-center opacity-50 transition-[opacity,transform] duration-500 ease-out hover:opacity-[0.65] focus-visible:opacity-[0.65]",
    onClick && "cursor-pointer",
    floating &&
      `absolute left-1/2 z-20 -translate-x-1/2 ${SCROLL_LINE_INDICATOR_BOTTOM_CLASS}`,
    className,
  );

  const ariaLabel = label ?? "Scroll down";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={rootClass}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
