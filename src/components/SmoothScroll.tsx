"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import type { LenisInstance } from "@/lib/lenis";
import {
  getLenisPointerProfile,
  getLenisPresetFromPathname,
  getLenisRuntimeOptions,
  normalizeLenisPreset,
  type LenisPointerProfile,
  type LenisScrollPreset,
  type SmoothScrollPreset,
} from "@/lib/lenisConfig";
import { attachLenisScrollBridge } from "@/lib/lenisScrollBridge";
import { routeLenisVirtualScrollOverHorizontalRail } from "@/lib/hscrollLenisRouting";
import { markDisplayRefreshRate } from "@/lib/displayRefreshRate";

export type { LenisScrollPreset, SmoothScrollPreset };

function useLenisPointerProfile(): LenisPointerProfile {
  const [profile, setProfile] = useState<LenisPointerProfile>("fine");

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () =>
      setProfile(mq.matches ? "coarse" : "fine");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return profile;
}

export default function SmoothScroll({
  children,
  preset: presetProp,
}: {
  children: ReactNode;
  /** Omit to auto-resolve from pathname (`/book` → balanced, else extreme). */
  preset?: SmoothScrollPreset;
}) {
  const pathname = usePathname();
  const pointerProfile = useLenisPointerProfile();

  const preset: LenisScrollPreset = useMemo(() => {
    if (presetProp != null) return normalizeLenisPreset(presetProp);
    return getLenisPresetFromPathname(pathname ?? "/");
  }, [pathname, presetProp]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const path = pathname ?? "/";
    // Dashboard uses its own scroll roots — Lenis must not hijack wheel/touch there.
    if (path.startsWith("/dashboard") || path === "/login") {
      return;
    }

    const profile = getLenisPointerProfile();

    // Mobile/tablet: pure native touch scroll — no Lenis rAF loop competing with the
    // browser compositor (eliminates stutter when sticky sections pin/unpin).
    if (profile === "coarse") {
      return;
    }

    const runtime = getLenisRuntimeOptions(preset);

    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");
    root.dataset.jadeLenisPreset = preset;
    root.dataset.jadeLenisProfile = profile;
    markDisplayRefreshRate(root);

    const lenis = new Lenis({
      lerp: runtime.lerp,
      smoothWheel: true,
      wheelMultiplier: runtime.wheelMultiplier,
      touchMultiplier: runtime.touchMultiplier,
      syncTouch: runtime.syncTouch,
      syncTouchLerp: runtime.syncTouchLerp,
      allowNestedScroll: true,
      virtualScroll: routeLenisVirtualScrollOverHorizontalRail,
      easing: runtime.easing,
      autoResize: true,
      autoRaf: true,
      anchors: {
        duration: runtime.anchorDuration,
        easing: runtime.easing,
        offset: -88,
      },
    });

    (window as unknown as { __lenis: LenisInstance | null }).__lenis =
      lenis as unknown as LenisInstance;

    const detachBridge = attachLenisScrollBridge(lenis);

    const onResize = () => lenis.resize();
    window.addEventListener("resize", onResize, { passive: true });

    const burstResize = () => lenis.resize();
    burstResize();
    const burstTimers = [120, 400, 900, 1800].map((ms) =>
      setTimeout(burstResize, ms),
    );
    window.addEventListener("load", burstResize, { once: true });

    return () => {
      burstTimers.forEach(clearTimeout);
      window.removeEventListener("load", burstResize);
      window.removeEventListener("resize", onResize);
      detachBridge();
      lenis.destroy();
      (window as unknown as { __lenis: LenisInstance | null }).__lenis = null;
      root.classList.remove("lenis", "lenis-smooth", "jade-hrr");
      delete root.dataset.jadeDisplayHz;
      delete root.dataset.jadeLenisPreset;
      delete root.dataset.jadeLenisProfile;
    };
  }, [preset, pointerProfile, pathname]);

  return <>{children}</>;
}
