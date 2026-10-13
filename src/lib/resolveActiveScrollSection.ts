import { getScrollSectionElement } from "@/lib/scrollSectionElement";

/**
 * Picks the section id that best matches the current scroll position.
 * Uses the sticky-tab anchor line: last section (in page order) whose top has passed it.
 */
export function resolveActiveScrollSection(
  sectionIds: readonly string[],
  root: HTMLElement | null,
  offsetPx = 96,
): string | null {
  if (typeof window === "undefined") return sectionIds[0] ?? null;

  const rootTop = root?.getBoundingClientRect().top ?? 0;
  const anchorY = rootTop + offsetPx;

  let activeId: string | null = null;

  for (const id of sectionIds) {
    const el = getScrollSectionElement(root, id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= anchorY) activeId = id;
  }

  if (activeId) return activeId;

  for (const id of sectionIds) {
    const el = getScrollSectionElement(root, id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const bottom =
      root == null ? window.innerHeight : rootTop + root.clientHeight;
    if (rect.bottom > rootTop && rect.top < bottom) return id;
  }

  const scrollTop = root == null ? window.scrollY : root.scrollTop;
  const viewHeight = root == null ? window.innerHeight : root.clientHeight;
  const scrollHeight =
    root == null ? document.documentElement.scrollHeight : root.scrollHeight;

  if (scrollTop + viewHeight >= scrollHeight - 48) {
    return sectionIds[sectionIds.length - 1] ?? null;
  }

  return sectionIds[0] ?? null;
}
