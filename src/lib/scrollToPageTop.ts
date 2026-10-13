import { getLenis, scrollToY } from "@/lib/lenis";

/** Remove hash anchors so the browser does not jump mid-page on load/navigation. */
export function clearUrlHash() {
  if (typeof window === "undefined" || !window.location.hash) return;
  const url = window.location.pathname + window.location.search;
  window.history.replaceState(window.history.state, "", url);
}

/** Reset scrollable regions inside the current page `<main>`. */
export function resetMainScrollContainers() {
  if (typeof document === "undefined") return;
  const main = document.querySelector("main");
  if (!main) return;

  if (main instanceof HTMLElement && main.hasAttribute("data-page-scroll-root")) {
    main.scrollTop = 0;
    main.scrollLeft = 0;
  }

  main
    .querySelectorAll<HTMLElement>(
      '[data-page-scroll-root], [class*="overflow-y-auto"], [class*="overflow-y-scroll"]',
    )
    .forEach((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
}

/**
 * Scroll window + Lenis + in-page scroll roots to the top (hero / first section).
 * Safe to call on every route change, refresh, redirect, and history navigation.
 */
export function scrollToPageTop() {
  if (typeof window === "undefined") return;

  clearUrlHash();

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  scrollToY(0, { immediate: true });
  resetMainScrollContainers();
}

/** Repeated top scroll to win over Lenis, lazy layout, and browser restoration. */
export function scrollToPageTopWithRetries() {
  scrollToPageTop();

  requestAnimationFrame(() => {
    scrollToPageTop();
    getLenis()?.resize();
  });

  for (const delay of [0, 100, 300]) {
    window.setTimeout(() => {
      scrollToPageTop();
      if (delay >= 100) getLenis()?.resize();
    }, delay);
  }
}
