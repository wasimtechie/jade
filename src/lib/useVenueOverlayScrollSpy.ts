"use client";

import type { RefObject } from "react";
import { useSectionScrollSpy } from "@/lib/useSectionScrollSpy";
import {
  VENUE_OVERLAY_SECTION_IDS,
  VENUE_OVERLAY_TAB_OFFSET_PX,
  venueTabFromSectionId,
} from "@/lib/venueOverlaySectionNav";

/** Scroll-spy for wedding / corporate / party venue overlays (inner scroll root). */
export function useVenueOverlayScrollSpy(
  scrollRootRef: RefObject<HTMLDivElement | null>,
  setActiveTab: (tab: string) => void,
  enabled: boolean,
  rootVersion = 0,
) {
  useSectionScrollSpy({
    sectionIds: VENUE_OVERLAY_SECTION_IDS,
    rootRef: scrollRootRef,
    enabled,
    rootVersion,
    offsetPx: VENUE_OVERLAY_TAB_OFFSET_PX,
    onActiveSection: (sectionId) => {
      const tab = venueTabFromSectionId(sectionId);
      if (tab) setActiveTab(tab);
    },
  });
}
