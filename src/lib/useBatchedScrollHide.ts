"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getLenis } from "@/lib/lenis";
import { subscribeLenisScrollImmediate } from "@/lib/lenisScrollBridge";

type HideListener = (hidden: boolean) => void;

let hidden = false;
const listeners = new Set<HideListener>();
let subscriberCount = 0;
let disposeEngine: (() => void) | undefined;

function syncChromeHiddenClass(next: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("jade-scroll-chrome-hidden", next);
}

function emit(next: boolean) {
  if (next === hidden) return;
  hidden = next;
  syncChromeHiddenClass(next);
  listeners.forEach((fn) => fn(hidden));
}

/** Ignore micro-reversals near sticky section boundaries (prevents chrome shake). */
const VELOCITY_DEADZONE = 1.15;
/** Minimum travel before toggling hide direction. */
const MIN_DIRECTION_DELTA_PX = 22;
/** Always show chrome near the top of the page. */
const TOP_SHOW_THRESHOLD_PX = 12;

/** Navbar: hide on scroll down, show on scroll up — with coasting deadzone. */
function attachScrollHideEngine(): () => void {
  let lastY = getLenis()?.scroll ?? window.scrollY;
  let anchorY = lastY;

  const evaluate = (y: number, velocity?: number, direction?: number) => {
    if (y <= TOP_SHOW_THRESHOLD_PX) {
      lastY = y;
      anchorY = y;
      emit(false);
      return;
    }

    const absVel = Math.abs(velocity ?? 0);
    if (absVel > 0 && absVel < VELOCITY_DEADZONE) {
      lastY = y;
      return;
    }

    lastY = y;

    if (direction != null && direction !== 0 && absVel >= VELOCITY_DEADZONE) {
      emit(direction > 0);
      anchorY = y;
      return;
    }

    const deltaFromAnchor = y - anchorY;
    if (deltaFromAnchor >= MIN_DIRECTION_DELTA_PX) {
      emit(true);
      anchorY = y;
    } else if (deltaFromAnchor <= -MIN_DIRECTION_DELTA_PX) {
      emit(false);
      anchorY = y;
    }
  };

  const unsubLenis = subscribeLenisScrollImmediate(({ scroll, direction, velocity }) => {
    evaluate(scroll, velocity, direction);
  });

  const onWindowScroll = () => {
    if (getLenis()) return;
    evaluate(window.scrollY);
  };

  window.addEventListener("scroll", onWindowScroll, { passive: true });
  evaluate(lastY);

  return () => {
    unsubLenis();
    window.removeEventListener("scroll", onWindowScroll);
  };
}

function subscribeHide(listener: HideListener): () => void {
  listeners.add(listener);
  listener(hidden);
  return () => listeners.delete(listener);
}

function acquireEngine() {
  subscriberCount += 1;
  if (subscriberCount === 1) {
    disposeEngine = attachScrollHideEngine();
  }
}

function releaseEngine() {
  subscriberCount = Math.max(0, subscriberCount - 1);
  if (subscriberCount === 0) {
    disposeEngine?.();
    disposeEngine = undefined;
    hidden = false;
    syncChromeHiddenClass(false);
    listeners.forEach((fn) => fn(false));
  }
}

/** Navbar: hide on scroll down, show on scroll up (deadzone while coasting). */
export function useBatchedScrollHide(): boolean {
  useEffect(() => {
    acquireEngine();
    return releaseEngine;
  }, []);

  return useSyncExternalStore(
    subscribeHide,
    () => hidden,
    () => false,
  );
}
