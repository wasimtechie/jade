import { PANEL_SCROLL_EASING, PANEL_SMOOTH_SCROLL_MS } from "@/lib/lenisConfig";

type SmoothScrollOptions = {
  duration?: number;
  immediate?: boolean;
  axis?: "x" | "y";
};

/** RAF eased scroll for Lenis-prevent panels and horizontal tab tracks. */
export function smoothScrollTo(
  el: HTMLElement | Window,
  target: number,
  options?: SmoothScrollOptions,
): void {
  if (typeof window === "undefined") return;

  const axis = options?.axis ?? "y";
  const isWindow = el === window;
  const node = isWindow ? null : (el as HTMLElement);

  const read = () =>
    isWindow
      ? axis === "x"
        ? window.scrollX
        : window.scrollY
      : axis === "x"
        ? node!.scrollLeft
        : node!.scrollTop;

  const write = (value: number) => {
    if (isWindow) {
      if (axis === "x") window.scrollTo(value, window.scrollY);
      else window.scrollTo(window.scrollX, value);
      return;
    }
    if (axis === "x") node!.scrollLeft = value;
    else node!.scrollTop = value;
  };

  if (options?.immediate) {
    write(target);
    return;
  }

  const start = read();
  const delta = target - start;
  if (Math.abs(delta) < 1) return;

  const duration = options?.duration ?? PANEL_SMOOTH_SCROLL_MS;
  let startTime: number | null = null;
  let rafId = 0;

  const step = (now: number) => {
    if (startTime == null) startTime = now;
    const t = Math.min(1, (now - startTime) / duration);
    write(start + delta * PANEL_SCROLL_EASING(t));
    if (t < 1) rafId = requestAnimationFrame(step);
  };

  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(step);
}

/** Center a child horizontally inside an overflow-x track. */
export function smoothScrollTabIntoView(
  track: HTMLElement,
  tabEl: HTMLElement,
  duration = PANEL_SMOOTH_SCROLL_MS,
): void {
  const target =
    tabEl.offsetLeft - (track.clientWidth - tabEl.offsetWidth) / 2;
  smoothScrollTo(track, Math.max(0, target), { duration, axis: "x" });
}
