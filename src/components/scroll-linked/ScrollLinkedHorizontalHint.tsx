"use client";

import clsx from "clsx";
import { ChevronsLeft, ChevronsRight, Hand } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SCROLL_LINKED_HORIZONTAL_HINT_BOTTOM_CLASS } from "@/lib/layoutSpacing";

export type ScrollLinkedHorizontalHintProps = {
  className?: string;
};

/**
 * Short animated cue — horizontal swipe / drag is available in scroll-linked sections.
 */
export function ScrollLinkedHorizontalHint({
  className,
}: ScrollLinkedHorizontalHintProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-x-0 z-[70] flex flex-col items-center gap-2 px-4",
        SCROLL_LINKED_HORIZONTAL_HINT_BOTTOM_CLASS,
        className,
      )}
      aria-hidden
    >
      <span className="font-manrope text-[10px] tracking-[0.28em] uppercase text-white/45 text-center">
        Scroll, swipe, or drag sideways
      </span>
      <div
        className={clsx(
          "jade-scroll-hint-gesture flex items-center gap-2.5 rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-sm",
          !reducedMotion && "jade-scroll-hint-gesture--animate",
        )}
      >
        <ChevronsLeft className="jade-scroll-hint-arrow-left h-4 w-4 text-[#EFCD62]/75" />
        <Hand className="jade-scroll-hint-hand h-5 w-5 text-white/85" />
        <ChevronsRight className="jade-scroll-hint-arrow-right h-4 w-4 text-[#EFCD62]/75" />
      </div>
    </div>
  );
}
