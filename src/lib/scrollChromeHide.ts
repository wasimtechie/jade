/** Overlay desktop close — hide only after this scroll depth (px). */
export const SCROLL_CHROME_HIDE_THRESHOLD = 150;

/**
 * Overlay panel scroll: hide when scrolling down past threshold.
 */
export function shouldHideScrollChrome(
  scrollY: number,
  lastScrollY: number,
  threshold = SCROLL_CHROME_HIDE_THRESHOLD,
): boolean {
  return scrollY > lastScrollY && scrollY > threshold;
}
