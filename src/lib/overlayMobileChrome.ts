/**
 * Mobile overlay bottom chrome — safe-area + browser toolbar (visualViewport).
 * Keeps pricing / action bars above iOS Safari & Android browser nav.
 */

export const OVERLAY_BROWSER_BOTTOM_INSET_VAR =
  "--jade-overlay-browser-bottom-inset";

const MOBILE_OVERLAY_MQ = "(max-width: 767px)";

export function isOverlayMobileChrome(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_OVERLAY_MQ).matches;
}

/** Layout viewport space below visualViewport (browser bottom toolbar). */
export function readOverlayBrowserBottomInset(): number {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  const belowVv = window.innerHeight - vv.height - vv.offsetTop;
  return Math.max(0, Math.round(belowVv));
}

export function syncOverlayMobileChrome(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    OVERLAY_BROWSER_BOTTOM_INSET_VAR,
    `${readOverlayBrowserBottomInset()}px`,
  );
}

export function clearOverlayMobileChrome(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.removeProperty(OVERLAY_BROWSER_BOTTOM_INSET_VAR);
}

/** Subscribe while an overlay is open; returns cleanup. */
export function subscribeOverlayMobileChrome(): () => void {
  if (typeof window === "undefined") return () => {};

  const sync = () => {
    if (isOverlayMobileChrome()) syncOverlayMobileChrome();
    else clearOverlayMobileChrome();
  };

  sync();
  requestAnimationFrame(sync);
  const settleTimer = window.setTimeout(sync, 120);
  const vv = window.visualViewport;
  vv?.addEventListener("resize", sync);
  vv?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", sync);

  return () => {
    window.clearTimeout(settleTimer);
    vv?.removeEventListener("resize", sync);
    vv?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("orientationchange", sync);
    clearOverlayMobileChrome();
  };
}

/** Bottom padding for pinned overlay action / pricing bars (mobile). */
export const OVERLAY_MOBILE_ACTION_BAR_PB_CLASS =
  "pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+var(--jade-overlay-browser-bottom-inset,0px)))]";

/**
 * Scroll-end spacer — matches mobile booking bar (pt-4 + row + pb).
 * @see EXPERIENCE_OVERLAY_BOOKING_BAR_SPACER_CLASS
 */
export const OVERLAY_MOBILE_ACTION_BAR_SPACER_CLASS =
  "h-[calc(4.5rem+max(0.75rem,calc(env(safe-area-inset-bottom,0px)+var(--jade-overlay-browser-bottom-inset,0px))))] shrink-0 md:hidden";

/** Form overlay scroll container — CTA clearance above sheet lip + browser chrome. */
export const OVERLAY_MOBILE_FORM_SCROLL_PAD_CLASS =
  "max-md:pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+var(--jade-overlay-browser-bottom-inset,0px)+1.25rem))]";
