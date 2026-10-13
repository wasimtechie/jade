"use client";

import ScrollLinkedHorizontalSection from "@/components/scroll-linked/ScrollLinkedHorizontalSection";
import ScrollLinkedPanelCard, {
  type ScrollLinkedPanelData,
} from "@/components/scroll-linked/ScrollLinkedPanelCard";
import ScrollLinkedWaysOverviewPanel from "@/components/scroll-linked/ScrollLinkedWaysOverviewPanel";
import { experiencePanelHref, villaListingPath } from "@/lib/appRoutes";
import { useScrollLinkedSectionHeight } from "@/lib/useScrollLinkedSectionHeight";
import { scrollLinkedMobileSnapHookStepCount } from "@/lib/scrollLinkedMobileSnap";
import { WAYS_JADE_EXPERIENCES_OVERVIEW_TILES } from "@/lib/waysJadeOverviewTiles";

const PANELS: ScrollLinkedPanelData[] = [
  {
    id: "weekend",
    title: "Weekend Getaways",
    subtext:
      "A day or two with your friends and family away from the bustling city in the wilderness is truly on everyone’s wishlist.",
    cta: "SEE WHAT A GETAWAY LOOKS LIKE",
    href: experiencePanelHref("Weekend Getaways"),
    image: "/Experiences/Weekend Getaways/1-Hero/casual stays.webp",
    mobileImage: "/Website Ratio Changes/Weekend_GetAways.webp",
  },
  {
    id: "celebrations",
    title: "Celebrations & Parties",
    subtext:
      "Birthdays, pool parties and bachelor celebrations unfold across private farmhouse Villas with pools, open lawns, and entertainment-ready spaces.",
    cta: "SEE HOW CELEBRATIONS COME ALIVE",
    href: experiencePanelHref("Party Venues"),
    image: "/Home Page/2-Experiences/celebrations & parties.webp",
    mobileImage: "/Website Ratio Changes/POOL PARTY.webp",
  },
  {
    id: "weddings",
    title: "Weddings",
    subtext:
      "Intimate ceremonies to grand, multi-day wedding celebrations, set amid private gardens, sprawling lawns, and luxury rooms.",
    cta: "SEE HOW WEDDINGS UNFOLD",
    href: experiencePanelHref("Weddings"),
    image: "/Experiences/Weddings/1-Hero/2 (1).webp",
  },
];

const OVERVIEW_INDEX = PANELS.length;
const panelCount = PANELS.length + 1;
const totalSteps = panelCount;

export default function ExperiencesScrollSection() {
  const sectionHeightVh = useScrollLinkedSectionHeight(
    "experiences",
    "mobileSnapOnly",
    scrollLinkedMobileSnapHookStepCount(totalSteps),
  );

  return (
    <ScrollLinkedHorizontalSection
      sectionHeightVh={sectionHeightVh}
      stepCount={totalSteps}
      hasEndCta={false}
      bgClassName="bg-[#1A1C1E]"
      headerLabel="WAYS JADE IS EXPERIENCED"
      scrollMode="mobileSnapOnly"
    >
      {(panelProgress) => (
        <>
          {PANELS.map((panel, i) => (
            <ScrollLinkedPanelCard
              key={panel.id}
              data={panel}
              index={i}
              panelProgress={panelProgress}
              totalSteps={totalSteps}
              panelCount={panelCount}
              snapCentered
            />
          ))}
          <ScrollLinkedWaysOverviewPanel
            tiles={WAYS_JADE_EXPERIENCES_OVERVIEW_TILES}
            index={OVERVIEW_INDEX}
            panelProgress={panelProgress}
            totalSteps={totalSteps}
            panelCount={panelCount}
            ctaHref={villaListingPath()}
            ctaLabel="SEE ALL EXPERIENCES"
            gapBgClassName="bg-[#1A1C1E]"
            snapCentered
          />
        </>
      )}
    </ScrollLinkedHorizontalSection>
  );
}
