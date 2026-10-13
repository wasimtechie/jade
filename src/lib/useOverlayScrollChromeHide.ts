"use client";

import { useCallback, useRef, useState } from "react";
import { scheduleScrollUpdate } from "@/lib/batchScrollUpdate";
import {
  SCROLL_CHROME_HIDE_THRESHOLD,
  shouldHideScrollChrome,
} from "@/lib/scrollChromeHide";

/** Hide overlay close chrome when scrolling down inside a nested scroll panel. */
export function useOverlayScrollChromeHide(
  threshold = SCROLL_CHROME_HIDE_THRESHOLD,
) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const currentScrollY = e.currentTarget.scrollTop;
      scheduleScrollUpdate(() => {
        const previous = lastScrollY.current;
        const nextHidden = shouldHideScrollChrome(
          currentScrollY,
          previous,
          threshold,
        );
        setIsHidden((prev) => (prev === nextHidden ? prev : nextHidden));
        lastScrollY.current = currentScrollY;
      });
    },
    [threshold],
  );

  return { isHidden, onScroll };
}
