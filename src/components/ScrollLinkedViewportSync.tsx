"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  clearScrollLinkedMobileViewport,
  isScrollLinkedMobileViewport,
  measureScrollLinkedChromeHeights,
  syncScrollLinkedMobileViewport,
} from "@/lib/scrollLinkedMobileViewport";

/**
 * Computes the stable mobile scroll-linked frame on mount, orientation change, and
 * width change only. Height-only resizes (mobile browser chrome show/hide and the
 * overlay navbar appearing) are ignored so the body never jerks while scrolling.
 */
export default function ScrollLinkedViewportSync() {
  const pathname = usePathname() ?? "";
  const lastWidthRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/dashboard") || pathname === "/login") {
      clearScrollLinkedMobileViewport();
      return;
    }

    const mq = window.matchMedia("(max-width: 1023px)");

    const recompute = () => {
      if (!mq.matches) {
        clearScrollLinkedMobileViewport();
        return;
      }
      measureScrollLinkedChromeHeights();
      syncScrollLinkedMobileViewport();
    };

    const onResize = () => {
      // Ignore height-only changes (browser chrome / navbar overlay) — width is the
      // only trigger that should reflow the scroll-linked frame.
      if (window.innerWidth === lastWidthRef.current) return;
      lastWidthRef.current = window.innerWidth;
      recompute();
    };

    lastWidthRef.current = window.innerWidth;
    recompute();

    window.addEventListener("orientationchange", recompute);
    window.addEventListener("resize", onResize, { passive: true });
    mq.addEventListener("change", recompute);

    const burst = [120, 400, 900].map((ms) => setTimeout(recompute, ms));

    return () => {
      burst.forEach(clearTimeout);
      window.removeEventListener("orientationchange", recompute);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", recompute);
      if (isScrollLinkedMobileViewport()) clearScrollLinkedMobileViewport();
    };
  }, [pathname]);

  return null;
}
