"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  SCROLL_LINKED_DESKTOP_PEEK_RATIO,
  resolveScrollLinkedLegacyGapAddon,
  type ScrollLinkedPanelGapVariant,
} from "@/lib/scrollLinkedPanelLayout";
import type { ScrollLinkedSlideAxis } from "@/lib/useScrollLinkedSlideAxis";

const DESKTOP_MQ = "(min-width: 1024px)";

export type UseScrollLinkedPanelOffsetOptions = {
  /** @deprecated Use variant — visibleGap overrides breakpoint constants when set. */
  visibleGap?: number;
  variant?: ScrollLinkedPanelGapVariant;
  /** Mobile snap — full viewport between card centres so neighbours stay off-screen. */
  snapCentered?: boolean;
  /** Mobile / tablet — stack cards vertically (default when snapCentered). */
  mobileAxis?: ScrollLinkedSlideAxis;
};

/** Tailwind max-width fallbacks when measure ref is not mounted. */
export function fallbackScrollLinkedPanelWidth(viewportWidth: number): number {
  const panelWidth =
    viewportWidth >= 1280
      ? 896
      : viewportWidth >= 768
        ? 672
        : viewportWidth >= 640
          ? 512
          : 448;
  return Math.min(panelWidth, viewportWidth - 48);
}

function readViewportWidth(): number {
  if (typeof window === "undefined") return 375;
  return window.innerWidth;
}

/**
 * Legacy mobile offset — also used when visibleGap is explicitly overridden.
 */
function computeLegacyOffsetPx(
  viewportWidth: number,
  panelWidth: number,
  gapAddon: number,
): number {
  return Math.ceil(viewportWidth / 2 + panelWidth / 2 + gapAddon);
}

/**
 * Desktop/laptop: visible peek between card edges ≈ offsetPx − panelWidth.
 * Scale legacy peek by SCROLL_LINKED_DESKTOP_PEEK_RATIO (keep 20% = −80%).
 */
function computeDesktopOffsetPx(
  viewportWidth: number,
  panelWidth: number,
  variant: ScrollLinkedPanelGapVariant,
): number {
  const legacyAddon = resolveScrollLinkedLegacyGapAddon(variant);
  const legacyPeek = viewportWidth / 2 - panelWidth / 2 + legacyAddon;
  const desktopPeek = Math.max(0, legacyPeek * SCROLL_LINKED_DESKTOP_PEEK_RATIO);
  return Math.ceil(panelWidth + desktopPeek);
}

function readStageHeight(measureEl: HTMLElement | null): number {
  const stage = measureEl?.closest(
    ".jade-scroll-linked-stage",
  ) as HTMLElement | null;
  if (stage?.clientHeight) return stage.clientHeight;
  if (typeof window !== "undefined") {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--jade-scroll-stage-mobile-height")
      .trim();
    if (raw) {
      const probe = document.createElement("div");
      probe.style.height = raw;
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const h = probe.offsetHeight;
      probe.remove();
      if (h > 0) return h;
    }
    return window.innerHeight;
  }
  return 700;
}

function computeVerticalOffsetPx(
  stageHeight: number,
  panelHeight: number,
  gapAddon: number,
  snapCentered: boolean,
): number {
  const legacy = Math.ceil(panelHeight + gapAddon);
  return snapCentered ? Math.max(stageHeight, legacy) : legacy;
}

function computeOffsetPx(
  viewportWidth: number,
  panelWidth: number,
  panelHeight: number,
  measureEl: HTMLElement | null,
  variant: ScrollLinkedPanelGapVariant,
  visibleGapOverride: number | undefined,
  snapCentered: boolean,
  mobileAxis: ScrollLinkedSlideAxis,
): number {
  const isDesktop = window.matchMedia(DESKTOP_MQ).matches;
  const gapAddon = resolveScrollLinkedLegacyGapAddon(variant);

  if (!isDesktop && mobileAxis === "vertical") {
    const stageHeight = readStageHeight(measureEl);
    return computeVerticalOffsetPx(
      stageHeight,
      panelHeight > 0 ? panelHeight : panelWidth,
      gapAddon,
      snapCentered,
    );
  }

  if (visibleGapOverride !== undefined) {
    const legacy = computeLegacyOffsetPx(
      viewportWidth,
      panelWidth,
      visibleGapOverride,
    );
    return snapCentered && !isDesktop
      ? Math.max(viewportWidth, legacy)
      : legacy;
  }
  if (isDesktop) {
    return computeDesktopOffsetPx(viewportWidth, panelWidth, variant);
  }
  const legacy = computeLegacyOffsetPx(
    viewportWidth,
    panelWidth,
    gapAddon,
  );
  return snapCentered ? Math.max(viewportWidth, legacy) : legacy;
}

/**
 * Horizontal scroll-linked panel offset — measured once per breakpoint resize.
 * Avoids visualViewport scroll listeners so card spacing stays fixed while scrolling.
 */
export function useScrollLinkedPanelOffset(
  measureRef: RefObject<HTMLElement | null>,
  options: UseScrollLinkedPanelOffsetOptions = {},
): { offsetPx: number; viewportWidth: number; stageHeight: number } {
  const variant = options.variant ?? "standard";
  const visibleGapOverride = options.visibleGap;
  const snapCentered = options.snapCentered ?? false;
  const mobileAxis = options.mobileAxis ?? (snapCentered ? "vertical" : "horizontal");
  const [offsetPx, setOffsetPx] = useState(1000);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [stageHeight, setStageHeight] = useState(700);

  useEffect(() => {
    const recompute = () => {
      const vw = readViewportWidth();
      const el = measureRef.current;
      const measured = el?.offsetWidth;
      const panelWidth =
        measured && measured > 0
          ? measured
          : fallbackScrollLinkedPanelWidth(vw);
      const panelHeight = el?.offsetHeight ?? panelWidth;
      const stage = readStageHeight(el);
      setViewportWidth(vw);
      setStageHeight(stage);
      setOffsetPx(
        computeOffsetPx(
          vw,
          panelWidth,
          panelHeight,
          el,
          variant,
          visibleGapOverride,
          snapCentered,
          mobileAxis,
        ),
      );
    };

    recompute();

    const mq = window.matchMedia(DESKTOP_MQ);
    window.addEventListener("resize", recompute, { passive: true });
    window.addEventListener("orientationchange", recompute);
    mq.addEventListener("change", recompute);

    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
      mq.removeEventListener("change", recompute);
    };
  }, [measureRef, visibleGapOverride, variant, snapCentered, mobileAxis]);

  return { offsetPx, viewportWidth, stageHeight };
}
