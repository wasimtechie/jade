/** Resolve a scroll-spy section inside an overlay/panel root (falls back to document). */
export function getScrollSectionElement(
  scopeRoot: HTMLElement | null | undefined,
  sectionId: string,
): HTMLElement | null {
  if (scopeRoot) {
    const scoped = scopeRoot.querySelector<HTMLElement>(
      `#${CSS.escape(sectionId)}`,
    );
    if (scoped) return scoped;
  }
  return document.getElementById(sectionId);
}
