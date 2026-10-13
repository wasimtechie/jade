"use client";

import clsx from "clsx";
import { ChevronsDown, ChevronsUp, Hand } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SCROLL_LINKED_VERTICAL_HINT_BOTTOM_CLASS } from "@/lib/layoutSpacing";

export type ScrollLinkedVerticalHintProps = {
  className?: string;
};

/**
 * End-of-section cue — mirrors {@link ScrollLinkedHorizontalHint} but for vertical scroll.
 */
export function ScrollLinkedVerticalHint({
  className,
}: ScrollLinkedVerticalHintProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-x-0 z-[110] flex flex-col items-center gap-1.5 px-4",
        SCROLL_LINKED_VERTICAL_HINT_BOTTOM_CLASS,
        className,
      )}
      aria-hidden
    >
      <span className="font-manrope text-[10px] tracking-[0.28em] uppercase text-white/45 text-center">
        Scroll down to continue
      </span>
      <div
        className={clsx(
          "jade-scroll-hint-gesture jade-scroll-hint-gesture--vertical flex flex-col items-center gap-1 rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-sm",
          !reducedMotion && "jade-scroll-hint-gesture--animate-vertical",
        )}
      >
        <ChevronsUp className="jade-scroll-hint-arrow-up h-4 w-4 text-[#EFCD62]/75" />
        <Hand className="jade-scroll-hint-hand-vertical h-5 w-5 text-white/85" />
        <ChevronsDown className="jade-scroll-hint-arrow-down h-4 w-4 text-[#EFCD62]/75" />
      </div>
    </div>
  );
}
