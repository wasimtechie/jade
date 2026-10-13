"use client";

import { useLayoutEffect, useRef } from "react";
import { smoothScrollTabIntoView } from "@/lib/smoothScrollTo";

const TAB_TRACK_SCROLL_MS = 420;

/** Keeps the active tab button centered in a horizontal overflow tab track. */
export function useScrollTabIntoView(activeTabKey: string) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !activeTabKey) return;

    const scrollActiveIntoView = () => {
      const activeBtn = track.querySelector<HTMLElement>(
        `[data-tab-key="${CSS.escape(activeTabKey)}"]`,
      );
      if (!activeBtn) return;
      smoothScrollTabIntoView(track, activeBtn, TAB_TRACK_SCROLL_MS);
    };

    scrollActiveIntoView();
    const raf = requestAnimationFrame(scrollActiveIntoView);
    return () => cancelAnimationFrame(raf);
  }, [activeTabKey]);

  return trackRef;
}
