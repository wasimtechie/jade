/** One curated poster per villa — paths under public/Villa_Retreats Hero folders. */
export const WALKTHROUGH_POSTER_BY_VILLA_ID: Record<string, string> = {
  magnolia: "/Villa_Retreats/Magnolia/Hero/hero.webp",
  tranquil: "/Villa_Retreats/Tranquil Woods/1-Hero/Hero 1.webp",
  royalty: "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
  diamond: "/Villa_Retreats/Diamond/Hero/Hero 2.webp",
  haven: "/Villa_Retreats/Haven/Hero/hero.webp",
  emerald: "/Villa_Retreats/Emerald/Hero/hero.webp",
  wonderland: "/Villa_Retreats/Wonderland/Hero/hero.webp",
  "jade-735": "/Villa_Retreats/Jade 735/Hero/hero.webp",
  palatio: "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
  "lounge-fly": "/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp",
  "retreat-on-the-ridge":
    "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
  "dome-villas": "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
  "dome-villas-blue":
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 1.webp",
  "dome-villas-red":
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 1.webp",
  "dome-villas-yellow":
    "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/Hero_evening_View.webp",
};

export type DomeWalkthroughTab = "blue" | "red" | "yellow";

export function getWalkthroughPosterForVilla(
  villaId: string,
  domeTab?: DomeWalkthroughTab,
): string {
  if (villaId === "dome-villas" && domeTab) {
    return WALKTHROUGH_POSTER_BY_VILLA_ID[`dome-villas-${domeTab}`] ?? "";
  }
  return WALKTHROUGH_POSTER_BY_VILLA_ID[villaId] ?? "";
}
