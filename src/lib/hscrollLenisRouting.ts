/** Horizontal marketing rails — shared Lenis + gesture routing. */

export const HORIZONTAL_SCROLL_RAIL_CLASS = "jade-hscroll-track";
export const AMENITY_HORIZONTAL_RAIL_CLASS = "amenity-highlight-track--responsive";

export const HORIZONTAL_SCROLL_RAIL_SELECTOR = `.${HORIZONTAL_SCROLL_RAIL_CLASS}, .${AMENITY_HORIZONTAL_RAIL_CLASS}`;

export function closestHorizontalScrollRail(
  node: EventTarget | null,
): HTMLElement | null {
  if (!(node instanceof HTMLElement)) return null;
  return node.closest<HTMLElement>(HORIZONTAL_SCROLL_RAIL_SELECTOR);
}

export function findHorizontalScrollRailInPath(
  event: Event,
): HTMLElement | undefined {
  const path =
    typeof event.composedPath === "function" ? event.composedPath() : [];
  for (const node of path) {
    const rail = closestHorizontalScrollRail(node);
    if (rail) return rail;
  }
  return undefined;
}

/**
 * Lenis virtualScroll routing over horizontal rails.
 *
 * - Touch (mobile): return false → native vertical page + native horizontal rail.
 * - Wheel vertical (desktop): return true → Lenis only (avoids native/Lenis fight = stutter).
 * - Wheel horizontal: return false → native rail scroll.
 */
export function routeLenisVirtualScrollOverHorizontalRail(data: {
  deltaX: number;
  deltaY: number;
  event: WheelEvent | TouchEvent;
}): boolean {
  if (!findHorizontalScrollRailInPath(data.event)) {
    return true;
  }

  if (data.event.type.startsWith("touch")) {
    return false;
  }

  const absY = Math.abs(data.deltaY);
  const absX = Math.abs(data.deltaX);

  if (absY > absX) {
    return true;
  }

  if (absX > 0) {
    return false;
  }

  return true;
}
