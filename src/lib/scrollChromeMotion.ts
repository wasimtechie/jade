/**
 * Framer motion for scroll-driven chrome hide.
 * Overlay close: `VillaExperienceOverlayCloseFramer` (variant `fixed`).
 */

export const SCROLL_CHROME_FRAMER_TRANSITION = {
  duration: 0.3,
  ease: "easeInOut" as const,
};

/**
 * Global Navbar + page action chrome (View Villa, Spaces, etc.).
 * Single source — same duration and ease-in-out curve everywhere.
 */
export const SCROLL_CHROME_HIDE_TRANSITION = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

/** @deprecated Use SCROLL_CHROME_HIDE_TRANSITION */
export const NAVBAR_SCROLL_CHROME_TRANSITION = SCROLL_CHROME_HIDE_TRANSITION;

export function scrollChromeHideAnimate(isHidden: boolean) {
  return {
    y: isHidden ? "-100%" : "0%",
    opacity: isHidden ? 0 : 1,
  };
}

export function scrollChromeHideMotionProps(
  isHidden: boolean,
  reduceMotion: boolean | null | undefined,
  options?: { fast?: boolean },
) {
  const transition = reduceMotion
    ? { duration: 0 }
    : options?.fast
      ? {
          type: "spring" as const,
          stiffness: 480,
          damping: 40,
          mass: 0.42,
          restDelta: 0.001,
        }
      : SCROLL_CHROME_HIDE_TRANSITION;

  return {
    initial: false as const,
    animate: scrollChromeHideAnimate(isHidden),
    transition,
    "aria-hidden": isHidden,
    style: {
      pointerEvents: (isHidden ? "none" : "auto") as "none" | "auto",
    },
  };
}

export function navbarScrollChromeAnimate(isHidden: boolean) {
  return scrollChromeHideAnimate(isHidden);
}

export const SCROLL_CHROME_FRAMER_INITIAL = {
  opacity: 0,
  scale: 0.9,
  y: 0,
};

/** Desktop overlay close uses y: -80 (48px button). Pass yHidden for taller chrome (e.g. navbar). */
export function scrollChromeAnimate(
  isHidden: boolean,
  options?: { yHidden?: number | string },
) {
  const yHidden = options?.yHidden ?? -80;
  return {
    opacity: isHidden ? 0 : 1,
    scale: isHidden ? 0.8 : 1,
    y: isHidden ? yHidden : 0,
  };
}
