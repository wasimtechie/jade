"use client";

import React from "react";
import {
  GLASS_BUTTON_RESET_CLASS,
  GLASS_CHROME_CONTENT_CLASS,
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";

type GlassChromePanelProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * One glass frame for stats strip and hero CTAs — same border, fill, blur, layering.
 */
export function GlassChromePanel({
  children,
  className = "",
  contentClassName = "",
}: GlassChromePanelProps) {
  return (
    <div className={`${GLASS_CHROME_FRAME_CLASS} ${className}`.trim()}>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-px z-0 block ${GLASS_INNER_SURFACE}`}
      />
      <div
        className={`${GLASS_CHROME_CONTENT_CLASS} ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}

type GlassChromeButtonPanelProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: React.ReactNode;
  contentClassName?: string;
};

/**
 * Same chrome as GlassChromePanel; native button reset only (no extra filters/tints).
 */
export function GlassChromeButtonPanel({
  children,
  className = "",
  contentClassName = "",
  type = "button",
  ...rest
}: GlassChromeButtonPanelProps) {
  return (
    <button
      type={type}
      className={`${GLASS_BUTTON_RESET_CLASS} ${GLASS_CHROME_FRAME_CLASS} ${className}`.trim()}
      {...rest}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-px z-0 block ${GLASS_INNER_SURFACE}`}
      />
      <span
        className={`${GLASS_CHROME_CONTENT_CLASS} ${contentClassName}`.trim()}
      >
        {children}
      </span>
    </button>
  );
}
