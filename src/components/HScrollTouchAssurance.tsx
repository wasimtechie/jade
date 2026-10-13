"use client";

import { useEffect } from "react";
import {
  closestHorizontalScrollRail,
  HORIZONTAL_SCROLL_RAIL_SELECTOR,
} from "@/lib/hscrollLenisRouting";
import { HORIZONTAL_RAIL_WHEEL_GAIN } from "@/lib/hscrollSensitivity";

/** Own scroll roots — full Lenis prevent. */
const FULL_LENIS_PREVENT_SELECTOR = "[data-page-scroll-root]";

function clearLenisBlocksOnHorizontalRail(el: HTMLElement) {
  el.removeAttribute("data-lenis-prevent");
  el.removeAttribute("data-lenis-prevent-touch");
  el.removeAttribute("data-lenis-prevent-wheel");
}

function applyFullLenisPrevent(el: HTMLElement) {
  if (!el.hasAttribute("data-lenis-prevent")) {
    el.setAttribute("data-lenis-prevent", "");
  }
}

/**
 * Marketing horizontal rails must NOT use data-lenis-prevent* — that locks vertical
 * scroll when the finger/cursor is on the row. Lenis allowNestedScroll + virtualScroll
 * routing handles axis choice. SDA scroller keeps full prevent.
 */
export default function HScrollTouchAssurance() {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const rail = closestHorizontalScrollRail(event.target);
      if (!rail) return;
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absX <= absY || absX === 0) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaX * HORIZONTAL_RAIL_WHEEL_GAIN;
    };

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });

    const apply = () => {
      document
        .querySelectorAll<HTMLElement>(HORIZONTAL_SCROLL_RAIL_SELECTOR)
        .forEach(clearLenisBlocksOnHorizontalRail);

      document
        .querySelectorAll<HTMLElement>(FULL_LENIS_PREVENT_SELECTOR)
        .forEach(applyFullLenisPrevent);
    };

    apply();

    const observer = new MutationObserver(() => {
      apply();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-lenis-prevent",
        "data-lenis-prevent-touch",
        "data-lenis-prevent-wheel",
        "class",
      ],
    });

    return () => {
      document.removeEventListener("wheel", onWheel, { capture: true });
      observer.disconnect();
    };
  }, []);

  return null;
}
