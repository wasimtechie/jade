import { experiencePanelHref } from "@/lib/appRoutes";

/** Experiences 4–7 compacted into one Ways Jade overview panel. */
export type WaysJadeOverviewTile = {
  id: string;
  title: string;
  href: string;
  image: string;
};

export const WAYS_JADE_HOME_OVERVIEW_TILES: WaysJadeOverviewTile[] = [
  {
    id: "corporate",
    title: "Corporate Retreats",
    href: experiencePanelHref("Corporate Retreats"),
    image: "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
  },
  {
    id: "wellness",
    title: "Wellness Retreats",
    href: experiencePanelHref("Wellness Retreats"),
    image: "/Home Page/2-Experiences/Wellness.webp",
  },
  {
    id: "caravans",
    title: "Caravans Journeys",
    href: experiencePanelHref("caravans"),
    image: "/Experiences/Caravan/1-Hero/14.webp",
  },
  {
    id: "casual-stays",
    title: "Casual Stays",
    href: experiencePanelHref("villas"),
    image: "/Home Page/2-Experiences/casual stays.webp",
  },
];

export const WAYS_JADE_EXPERIENCES_OVERVIEW_TILES: WaysJadeOverviewTile[] = [
  {
    id: "corporate",
    title: "Corporate Retreats",
    href: experiencePanelHref("Corporate Retreats"),
    image: "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
  },
  {
    id: "wellness",
    title: "Wellness Retreats",
    href: experiencePanelHref("Wellness Retreats"),
    image:
      "/Experiences/Weekend Getaways/2-What Weekends Look like/Nature & Nearby Escapes.webp",
  },
  {
    id: "caravans",
    title: "Caravans Journeys",
    href: experiencePanelHref("caravans"),
    image: "/Experiences/Caravan/1-Hero/6.webp",
  },
  {
    id: "casual-stays",
    title: "Casual Stays",
    href: experiencePanelHref("villas"),
    image: "/Villa_Retreats/Magnolia/Hero/hero.webp",
  },
];
