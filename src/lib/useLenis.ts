"use client";

import { useSyncExternalStore } from "react";
import { getLenis, type LenisInstance } from "@/lib/lenis";

/** Global Lenis from SmoothScroll (null until mounted or reduced motion). */
export function useLenis(): LenisInstance | null {
  return useSyncExternalStore(
    () => () => {},
    getLenis,
    () => null,
  );
}
