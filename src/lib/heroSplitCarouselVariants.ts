import type { Variants } from "framer-motion";
import { CAROUSEL_CROSSFADE } from "./carouselMotion";

const { duration, ease } = CAROUSEL_CROSSFADE;

/** No opacity tween — keeps incoming + outgoing mini frames fully “on” during overlap */
const cardTx = (d: number) => ({
  duration: d,
  ease,
  opacity: { duration: 0 },
  filter: { duration: 0 },
  zIndex: { duration: 0 },
});

export type HeroSplitCustom = { dir: number; lowFx: boolean };

function normDir(dir: number): 1 | -1 {
  if (dir === 0) return 1;
  return dir > 0 ? 1 : -1;
}

/**
 * Hero (full-bleed) layer: subtle 3D + blur + shear for a smooth “liquid” crossfade.
 */
export const heroSplitBgVariants: Variants = {
  enter: (c: HeroSplitCustom) => {
    if (c.lowFx) {
      return { opacity: 0, transition: { duration, ease } };
    }
    return {
      opacity: 0,
      scale: 1.05,
      transition: { duration: duration * 0.92, ease },
    };
  },
  center: (c: HeroSplitCustom) => {
    if (c.lowFx) {
      return { opacity: 1, transition: { duration, ease } };
    }
    return {
      opacity: 1,
      scale: 1,
      transition: { duration: duration * 1.08, ease },
    };
  },
  exit: (c: HeroSplitCustom) => {
    if (c.lowFx) {
      return { opacity: 0, transition: { duration, ease } };
    }
    return {
      opacity: 0,
      scale: 0.95,
      transition: { duration: duration * 0.86, ease },
    };
  },
};

/**
 * Mini frame: push previous slide out opposite to navigation, new enters from gesture side.
 * Next (+1): new from right (+100%), old exits left (-100%).
 * Opacity stays at 1 — motion is horizontal slide only (no fade).
 */
export const heroSplitCardVariants: Variants = {
  enter: (c: HeroSplitCustom) => {
    const dir = normDir(c.dir);
    const slide = c.lowFx ? `${dir * 85}%` : `${dir * 100}%`;
    const dur = duration * (c.lowFx ? 0.75 : 0.94);
    return {
      opacity: 1,
      zIndex: 2,
      x: slide,
      transition: cardTx(dur),
    };
  },
  center: (_c: HeroSplitCustom) => ({
    opacity: 1,
    zIndex: 2,
    x: "0%",
    transition: cardTx(duration),
  }),
  exit: (c: HeroSplitCustom) => {
    const dir = normDir(c.dir);
    const slide = c.lowFx ? `${-dir * 85}%` : `${-dir * 100}%`;
    const dur = duration * (c.lowFx ? 0.75 : 0.94);
    return {
      opacity: 1,
      zIndex: 1,
      x: slide,
      transition: cardTx(dur),
    };
  },
};

/** Same liquid 3D/blur layer as hero split carousels — for experience + villa image strips */
export const liquidCarouselBgVariants = heroSplitBgVariants;
