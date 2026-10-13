"use client";

import { useLayoutEffect } from "react";
import { subscribeOverlayMobileChrome } from "@/lib/overlayMobileChrome";

/** Sync browser bottom inset + mark body while a full-screen overlay is open. */
export function useOverlayMobileChrome(active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;

    document.body.setAttribute("data-jade-overlay-open", "");
    const unsubscribe = subscribeOverlayMobileChrome();

    return () => {
      document.body.removeAttribute("data-jade-overlay-open");
      unsubscribe();
    };
  }, [active]);
}
