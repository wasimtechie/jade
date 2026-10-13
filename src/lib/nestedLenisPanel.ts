"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { scheduleScrollUpdate } from "@/lib/batchScrollUpdate";
import {
  LENIS_EASING,
  PANEL_LENIS_LERP,
  PANEL_LENIS_WHEEL_MULTIPLIER,
} from "@/lib/lenisConfig";

type PanelLenis = InstanceType<typeof Lenis>;
type PanelScrollListener = () => void;

const instances = new WeakMap<HTMLElement, PanelLenis>();
const panelScrollListeners = new Map<HTMLElement, Set<PanelScrollListener>>();

function emitPanelScroll(wrapper: HTMLElement) {
  const listeners = panelScrollListeners.get(wrapper);
  if (!listeners?.size) return;
  scheduleScrollUpdate(() => {
    listeners.forEach((fn) => fn());
  });
}

/** Subscribe to smooth-scroll updates inside a nested Lenis panel (overlay body). */
export function subscribeNestedPanelScroll(
  wrapper: HTMLElement | null | undefined,
  listener: PanelScrollListener,
): () => void {
  if (!wrapper) return () => {};
  let set = panelScrollListeners.get(wrapper);
  if (!set) {
    set = new Set();
    panelScrollListeners.set(wrapper, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) panelScrollListeners.delete(wrapper);
  };
}

/** Silk wheel scroll inside a single data-lenis-prevent vertical panel. */
export function useNestedLenisPanel(
  scrollRootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const rafRef = useRef<number>(0);
  const lenisScrollUnsubRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const wrapper = scrollRootRef.current;
    if (!wrapper || !wrapper.hasAttribute("data-lenis-prevent")) return;

    const content =
      wrapper.querySelector<HTMLElement>("[data-overlay-scroll-content]") ??
      (wrapper.firstElementChild as HTMLElement | null) ??
      wrapper;

    let lenis = instances.get(wrapper);
    if (!lenis) {
      lenis = new Lenis({
        wrapper,
        content,
        lerp: PANEL_LENIS_LERP,
        smoothWheel: true,
        wheelMultiplier: PANEL_LENIS_WHEEL_MULTIPLIER,
        easing: LENIS_EASING,
        autoResize: true,
      });
      instances.set(wrapper, lenis);
      lenisScrollUnsubRef.current = lenis.on("scroll", () => {
        emitPanelScroll(wrapper);
      });
    }

    const raf = (time: number) => {
      lenis!.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenisScrollUnsubRef.current?.();
      lenisScrollUnsubRef.current = undefined;
      lenis!.destroy();
      instances.delete(wrapper);
      panelScrollListeners.delete(wrapper);
    };
  }, [scrollRootRef, enabled]);
}
