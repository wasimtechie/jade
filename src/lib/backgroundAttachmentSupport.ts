/**
 * Whether `background-attachment: fixed` is safe for parallax patterns.
 * iOS WebKit (Safari + CriOS) and coarse pointers get scroll attachment instead.
 */

function isIosWebKit(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/CriOS/i.test(ua)) return true;
  return /iPad|iPhone|iPod/i.test(ua);
}

export function supportsFixedBackgroundAttachment(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  if (window.matchMedia("(pointer: coarse)").matches) {
    return false;
  }

  if (isIosWebKit()) {
    return false;
  }

  return true;
}

/** Featured Villas: fixed parallax on section shell vs pattern on sticky stage. */
export function shouldDeferParallaxPatternToStickyStage(
  parallaxFixed?: boolean,
): boolean {
  return Boolean(parallaxFixed && !supportsFixedBackgroundAttachment());
}
