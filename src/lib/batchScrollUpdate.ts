/** Run at most one callback per animation frame (scroll hide, overlay chrome, etc.). */
export function scheduleScrollUpdate(run: () => void): void {
  if (typeof window === "undefined") {
    run();
    return;
  }
  const w = window as Window & { __jadeScrollRaf?: number };
  if (w.__jadeScrollRaf != null) cancelAnimationFrame(w.__jadeScrollRaf);
  w.__jadeScrollRaf = requestAnimationFrame(() => {
    w.__jadeScrollRaf = undefined;
    run();
  });
}
