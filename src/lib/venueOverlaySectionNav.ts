/** Section ids (DOM) ↔ tab labels used in venue know-more overlays. */

export const VENUE_OVERLAY_SECTION_IDS = [
  "amenities",
  "pricing",
  "location",
  "walkthrough",
  "faq",
  "key-policies",
  "enquiry",
] as const;

export const VENUE_OVERLAY_TABS = [
  "Amenities",
  "Pricing",
  "Location",
  "Walkthrough",
  "FAQ",
] as const;

export type VenueOverlayTab = (typeof VENUE_OVERLAY_TABS)[number];

const SECTION_TO_TAB: Record<string, VenueOverlayTab> = {
  amenities: "Amenities",
  pricing: "Pricing",
  location: "Location",
  walkthrough: "Walkthrough",
  faq: "FAQ",
  "key-policies": "FAQ",
  enquiry: "FAQ",
};

const TAB_TO_SECTION: Record<string, string> = {
  Amenities: "amenities",
  Pricing: "pricing",
  Location: "location",
  Walkthrough: "walkthrough",
  FAQ: "faq",
};

export function venueSectionIdFromTab(tab: string): string {
  return TAB_TO_SECTION[tab] ?? tab.toLowerCase();
}

export function venueTabFromSectionId(sectionId: string): VenueOverlayTab | null {
  return SECTION_TO_TAB[sectionId.toLowerCase()] ?? null;
}

export const VENUE_OVERLAY_TAB_OFFSET_PX = 88;
