/** Global Lenis instance (set in SmoothScroll). */

import {
  getLenisPresetConfig,
  getLenisPresetFromPathname,
} from "@/lib/lenisConfig";
import { smoothScrollTo } from "@/lib/smoothScrollTo";

export type LenisScrollToOptions = {
  immediate?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
  lock?: boolean;
  force?: boolean;
};

export type LenisInstance = {
  scroll: number;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: LenisScrollToOptions,
  ) => void;
  resize: () => void;
  stop: () => void;
  start: () => void;
  destroy: () => void;
  raf: (time: number) => void;
  on: (
    event: "scroll",
    callback: (lenis: {
      scroll: number;
      progress: number;
      velocity: number;
      direction: number;
    }) => void,
  ) => () => void;
};

export function getLenis(): LenisInstance | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { __lenis?: LenisInstance | null }).__lenis ?? null
  );
}

const defaultScrollToOpts = (): LenisScrollToOptions => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const preset = getLenisPresetFromPathname(pathname);
  const { scrollToDuration, easing } = getLenisPresetConfig(preset);
  return { duration: scrollToDuration, easing };
};

/** Smooth scroll window via Lenis, or eased RAF fallback. */
export function scrollToY(
  top: number,
  options?: { immediate?: boolean; duration?: number },
) {
  const lenis = getLenis();
  const scrollOpts = defaultScrollToOpts();
  if (lenis) {
    lenis.scrollTo(top, {
      ...scrollOpts,
      immediate: options?.immediate,
      duration: options?.duration ?? scrollOpts.duration,
    });
    return;
  }

  smoothScrollTo(window, top, {
    immediate: options?.immediate,
    duration: options?.duration
      ? options.duration * 1000
      : undefined,
  });
}

/** Scroll to a section element (sticky tab offset). */
export function scrollToElement(
  element: HTMLElement,
  options?: { offset?: number; immediate?: boolean; duration?: number },
) {
  const offset = options?.offset ?? 0;
  const lenis = getLenis();
  const scrollOpts = defaultScrollToOpts();

  if (lenis) {
    lenis.scrollTo(element, {
      ...scrollOpts,
      offset,
      immediate: options?.immediate,
      duration: options?.duration ?? scrollOpts.duration,
    });
    return;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY + offset;
  smoothScrollTo(window, Math.max(0, top), {
    immediate: options?.immediate,
    duration: options?.duration
      ? options.duration * 1000
      : undefined,
  });
}
