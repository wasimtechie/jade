"use client";

import { useCallback, type RefObject } from "react";
import { scrollToOverlaySection } from "@/lib/scrollToOverlaySection";
import {
  VENUE_OVERLAY_TABS,
  venueTabFromSectionId,
} from "@/lib/venueOverlaySectionNav";
import { useVenueOverlayScrollSpy } from "@/lib/useVenueOverlayScrollSpy";
import { lockScrollSpy } from "@/lib/scrollSpyLock";
import { PANEL_SMOOTH_SCROLL_MS } from "@/lib/lenisConfig";

/** Scroll-spy + scroll-to-section for wedding / corporate / party overlays. */
export function useVenueOverlaySectionNav(
  scrollRootRef: RefObject<HTMLDivElement | null>,
  setActiveTab: (tab: string) => void,
  enabled: boolean,
  scrollRootVersion = 0,
) {
  useVenueOverlayScrollSpy(
    scrollRootRef,
    setActiveTab,
    enabled,
    scrollRootVersion,
  );

  const scrollToSection = useCallback(
    (tabOrSectionId: string) => {
      const tab = venueTabFromSectionId(tabOrSectionId);
      if (tab) {
        setActiveTab(tab);
      } else if (
        (VENUE_OVERLAY_TABS as readonly string[]).includes(tabOrSectionId)
      ) {
        setActiveTab(tabOrSectionId);
      }
      lockScrollSpy(PANEL_SMOOTH_SCROLL_MS + 80);
      scrollToOverlaySection(tabOrSectionId, scrollRootRef.current);
    },
    [scrollRootRef, setActiveTab],
  );

  return { scrollToSection };
}
