export const HERO_OVERRIDES: Record<string, string[]> = {
  diamond: ["/Villa_Retreats/Diamond/Hero/Hero 2.webp"],
  "dome-villas": [
    "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
    "/Villa_Retreats/Dome/Hero Main/Hero 2.webp",
  ],
  "dome-villas-blue": [
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 1.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 2.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 3.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 4.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 5.webp",
  ],
  "dome-villas-red": [
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 1.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 2.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 3.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 4.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 5.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 6.webp",
  ],
  "dome-villas-yellow": [
    "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/Hero_evening_View.webp",
    "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/hero.webp",
  ],
  emerald: ["/Villa_Retreats/Emerald/Hero/hero.webp"],
  haven: ["/Villa_Retreats/Haven/Hero/hero.webp"],
  "jade-735": ["/Villa_Retreats/Jade 735/Hero/hero.webp"],
  "lounge-fly": ["/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp"],
  magnolia: ["/Villa_Retreats/Magnolia/Hero/hero.webp"],
  palatio: ["/Villa_Retreats/Palatio/1-Hero/Hero 1.webp"],
  "retreat-on-the-ridge": ["/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp"],
  royalty: [
    "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
    "/Villa_Retreats/Royalty/1-Hero/hero 2.webp",
  ],
  tranquil: [
    "/Villa_Retreats/Tranquil Woods/1-Hero/Hero 1.webp",
    "/Villa_Retreats/Tranquil Woods/1-Hero/Hero 2.webp",
  ],
  wonderland: [
    "/Villa_Retreats/Wonderland/Hero/hero.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 3.webp",
  ],
};

export function getHeroOverrideForId(id: string | undefined) {
  if (!id) return null;
  const list = HERO_OVERRIDES[id];
  return list?.length ? list : null;
}

