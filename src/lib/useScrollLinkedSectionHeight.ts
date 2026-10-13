"use client";

import { useMediaMinLg } from "@/lib/useMediaMinLg";
import { SCROLL_LINKED_SECTION_VH } from "@/lib/scrollLinkedFreeScroll";
import { scrollLinkedMobileSnapHeight } from "@/lib/scrollLinkedMobileSnap";
import type { ScrollLinkedScrollMode } from "@/lib/useScrollLinkedSectionProgress";

type SectionKey = keyof typeof SCROLL_LINKED_SECTION_VH;

/** Responsive pinned height for scroll-linked horizontal sections. */
export function useScrollLinkedSectionHeight(
  section: SectionKey,
  scrollMode: ScrollLinkedScrollMode = "free",
  stepCount?: number,
): number {
  const isLg = useMediaMinLg();
  if (!isLg && scrollMode === "mobileSnapOnly" && stepCount != null) {
    return scrollLinkedMobileSnapHeight(stepCount);
  }
  const map = SCROLL_LINKED_SECTION_VH[section];
  return isLg ? map.desktop : map.mobile;
}
