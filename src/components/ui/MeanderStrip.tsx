"use client";

import clsx from "clsx";
import { STICKY_TABS_MEANDER_TRACK_CLASS } from "@/lib/scrollChromeGlass";

type MeanderStripProps = {
  className?: string;
  /** Optional accent line below the pattern (e.g. green before pricing). */
  accentLine?: "green" | "none";
  /** Bar fill behind the Greek-key tile — matches the section above when possible. */
  track?: "charcoal" | "green" | "deep";
  /**
   * Sticky category chrome — glass track so the separator floats with the tab bar
   * over scrolling content (not a solid section divider).
   */
  chrome?: boolean;
  /**
   * fullBleed — edge-to-edge section divider (default).
   * pageGutter — mobile full-bleed; sm+ centered column with page gutters (sticky chrome).
   */
  layout?: "fullBleed" | "pageGutter";
};

const LAYOUT_SHELL: Record<NonNullable<MeanderStripProps["layout"]>, string> = {
  fullBleed:
    "relative w-screen max-w-[100vw] shrink-0 left-1/2 -translate-x-1/2",
  pageGutter:
    "relative w-full shrink-0 max-sm:w-screen max-sm:max-w-[100vw] max-sm:left-1/2 max-sm:-translate-x-1/2 sm:left-auto sm:translate-x-0 sm:max-w-7xl sm:mx-auto sm:px-4 md:px-6 lg:px-8",
};

const TRACK_CLASS: Record<NonNullable<MeanderStripProps["track"]>, string> = {
  charcoal: "bg-jade-charcoal/82",
  green: "bg-jade-green/82",
  deep: "bg-[#1A1C1E]/82",
};

/** Gold Greek-key band — tiles `public/assets/Sep_bar_design.svg` edge-to-edge */
export default function MeanderStrip({
  className = "",
  accentLine = "none",
  track = "charcoal",
  chrome = false,
  layout = "fullBleed",
}: MeanderStripProps) {
  return (
    <div
      className={clsx(LAYOUT_SHELL[layout], className)}
      aria-hidden="true"
    >
      <div
        className={clsx(
          "relative h-[23px] w-full",
          chrome ? STICKY_TABS_MEANDER_TRACK_CLASS : TRACK_CLASS[track],
        )}
      >
        <div
          className={clsx(
            "pointer-events-none absolute inset-y-0 left-[-1px] right-[-1px] bg-[url('/assets/Sep_bar_design.svg')] bg-left bg-repeat-x bg-[length:auto_23px]",
            chrome ? "opacity-70" : "opacity-50",
          )}
          role="presentation"
        />
      </div>
      {accentLine === "green" ? (
        <div className="h-[2px] w-full bg-jade-green" />
      ) : null}
    </div>
  );
}
