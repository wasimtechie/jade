/** Best-effort display Hz (Chromium `screen.refreshRate`; else assume 60). */
export function getDisplayRefreshRate(): number {
  if (typeof window === "undefined") return 60;
  const rate = (
    window.screen as Screen & { refreshRate?: number }
  ).refreshRate;
  return typeof rate === "number" && rate > 0 ? rate : 60;
}

export function isHighRefreshDisplay(hz = getDisplayRefreshRate()): boolean {
  return hz >= 90;
}

/** `data-jade-display-hz` on `<html>` for CSS/debug (SmoothScroll). */
export function markDisplayRefreshRate(root: HTMLElement = document.documentElement) {
  const hz = getDisplayRefreshRate();
  root.dataset.jadeDisplayHz = String(Math.round(hz));
  root.classList.toggle("jade-hrr", isHighRefreshDisplay(hz));
}
