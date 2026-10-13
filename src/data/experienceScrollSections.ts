import { LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT } from "@/lib/liveBackgroundScrollSection";

export type ExperienceScrollVariant =
  | "weekend"
  | "party"
  | "caravans"
  | "wedding"
  | "corporate";

export interface ExperienceScrollContent {
  label?: string;
  body: string;
  height?: string;
}

export const EXPERIENCE_SCROLL_SECTIONS: Record<
  ExperienceScrollVariant,
  ExperienceScrollContent
> = {
  weekend: {
    label: "A DIFFERENT KIND OF WEEKEND ESCAPE",
    body: "Jade's Private Villas offer space, privacy, and comfort just outside the city. Whether you're planning a relaxed stay with friends, a family getaway, or a small celebration, each retreat is designed to let you slow down and enjoy the moment.",
    height: LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT,
  },
  party: {
    label: "CELEBRATIONS, REIMAGINED",
    body: "Jade's Private Villas offer the perfect setting for unforgettable celebrations. Whether it's a birthday, anniversary, pool party, or reunion with friends, each space is designed for private gatherings with curated setups, great music, and moments worth celebrating.",
    height: LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT,
  },
  caravans: {
    label: "A PRIVATE RETREAT ON WHEELS",
    body: "Rathaa is a fully equipped luxury caravan designed for small-group journeys. Combining the comfort of a private stay with the freedom of road travel, it allows you to explore scenic destinations, celebrate special moments, or simply travel differently. From short day escapes to overnight and multi-day journeys, every experience is curated around your route, your group, and your pace.",
    height: LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT,
  },
  wedding: {
    body: "Hospitainment is the art of hosting experiences not just stays. At Jade, hospitality sets the foundation and entertainment activates the space.",
    height: LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT,
  },
  corporate: {
    body: "At Jade Hospitainment, corporate retreats are thoughtfully designed to balance productivity and relaxation. From strategic planning sessions and workshops to recognition nights and team celebrations, each gathering is structured around your objectives.",
    height: LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT,
  },
};
