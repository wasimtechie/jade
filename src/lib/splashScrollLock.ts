import { getLenis, scrollToY } from "@/lib/lenis";

const LOCK_CLASS = "jade-splash-locked";

/** Block page scroll / Lenis while the home splash curtain runs. */
export function lockSplashScroll() {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.classList.add(LOCK_CLASS);
  html.dataset.jadeSplashLock = "true";

  scrollToY(0, { immediate: true });
  getLenis()?.stop();
}

/** Restore scroll after splash curtain finishes. */
export function unlockSplashScroll() {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.classList.remove(LOCK_CLASS);
  delete html.dataset.jadeSplashLock;

  const lenis = getLenis();
  lenis?.start();
  lenis?.resize();
}

/** Re-apply lock until Lenis mounts (SmoothScroll initializes after first paint). */
export function scheduleSplashScrollLock() {
  lockSplashScroll();
  const timers = [50, 200, 500].map((ms) =>
    window.setTimeout(lockSplashScroll, ms),
  );
  return () => timers.forEach(clearTimeout);
}
