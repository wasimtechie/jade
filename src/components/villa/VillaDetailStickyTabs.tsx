"use client";

import clsx from "clsx";
import { stickyCategoryTabClass } from "@/lib/stickyTabGlass";
import { STICKY_BELOW_VILLA_ACTION_COMPACT_CLASS } from "@/lib/scrollChromeLayout";
import { VILLA_DETAIL_STICKY_TABS_CHROME_CLASS } from "@/lib/scrollChromeGlass";
import { useScrollTabIntoView } from "@/lib/useScrollTabIntoView";
import CategoryTabRail from "@/components/ui/CategoryTabRail";
import MeanderStrip from "@/components/ui/MeanderStrip";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
const vd = VILLA_DETAIL_SPACING;

const TAB_LABELS = [
  "Spaces",
  "Experiences",
  "Details",
  "Video Walkthrough",
  "Services",
  "Amenities",
  "Pricing",
  "Location",
  "Perfect For",
  "FAQ",
] as const;

function tabToSectionId(tab: string): string {
  if (tab === "Details") return "details";
  return tab.toLowerCase().replace(/ /g, "-");
}

type VillaDetailStickyTabsProps = {
  activeTab: string;
  onTabClick: (sectionId: string) => void;
  /** Sections present in the DOM — tabs for missing sections are hidden. */
  sectionIds?: readonly string[];
};

export default function VillaDetailStickyTabs({
  activeTab,
  onTabClick,
  sectionIds,
}: VillaDetailStickyTabsProps) {
  const trackRef = useScrollTabIntoView(activeTab);

  const visibleTabs = TAB_LABELS.filter((tab) => {
    const sectionId = tabToSectionId(tab);
    return sectionIds ? sectionIds.includes(sectionId) : true;
  });

  return (
    <>
      <MeanderStrip layout="fullBleed" track="charcoal" className="relative z-40" />
      <div
        className={clsx(
          "jade-hscroll-chrome sticky z-40",
          vd.stickyChromeOuter,
          STICKY_BELOW_VILLA_ACTION_COMPACT_CLASS,
          vd.hScrollViewportEdge,
        )}
      >
        <div className={clsx(vd.stickyChromeOuter, VILLA_DETAIL_STICKY_TABS_CHROME_CLASS)}>
          <div className={vd.stickyChromeInner}>
            <CategoryTabRail
              ref={trackRef}
              fadeFrom="#1A1C1E"
              patternFade
              mobileViewportEdge
              mobileTrackGutter
              cursorGrab
              trackClassName={vd.stickyTabTrackInset}
              trackAriaLabel="Villa sections"
            >
              {visibleTabs.map((tab) => {
                const sectionId = tabToSectionId(tab);
                const isActive = activeTab === sectionId;
                return (
                  <button
                    key={tab}
                    type="button"
                    data-tab-key={sectionId}
                    onClick={() => onTabClick(sectionId)}
                    className={clsx(
                      stickyCategoryTabClass(isActive),
                      "flex-shrink-0",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {tab === "Details" ? "Property Details" : tab}
                  </button>
                );
              })}
            </CategoryTabRail>
          </div>
        </div>
      </div>
    </>
  );
}
