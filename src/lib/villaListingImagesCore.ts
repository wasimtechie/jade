import { prettyMediaLabel } from "@/lib/mediaLabels";
import {
  isDashboardAuthoredVilla,
  hasExplicitHeroGallery,
  resolveVillaMedia,
} from "@/lib/villas/villaMediaResolution";

export type VillaGalleryItem = { name: string; image: string };

export type VillaListingImagesInput = {
  id: string;
  name?: string;
  image?: string;
  images?: string[];
  portfolioSource?: string;
};

type CategorizedSpace = {
  title?: string;
  category?: string;
  images?: string[];
};

export type VillaListingServerMedia = {
  hero?: string[];
  categorizedSpaces?: CategorizedSpace[];
};

const validImage = (img: string | undefined) => Boolean(img && img.length > 0);

/** Same carousel sources as `/retreats/` VillaCard — respects custom villa explicit media. */
export function buildVillaListingImages(
  villa: VillaListingImagesInput | null | undefined,
  serverMedia?: VillaListingServerMedia | null,
): VillaGalleryItem[] {
  if (!villa?.id) return [{ name: "Main", image: "" }];

  const source = {
    id: villa.id,
    name: villa.name,
    image: villa.image,
    images: villa.images,
    portfolioSource: villa.portfolioSource,
  };

  if (isDashboardAuthoredVilla(source) || hasExplicitHeroGallery(source)) {
    const heroes =
      serverMedia?.hero && serverMedia.hero.length > 0
        ? serverMedia.hero
        : resolveVillaMedia(source).hero;

    if (heroes.length > 0) {
      return heroes.map((image, i) => ({
        name: i === 0 ? "Main" : `Slide ${i + 1}`,
        image,
      }));
    }
    if (validImage(villa.image)) {
      return [{ name: "Main", image: villa.image as string }];
    }
    return [{ name: "Main", image: "" }];
  }

  const resolved = resolveVillaMedia(source);
  const heroes =
    serverMedia?.hero && serverMedia.hero.length > 0
      ? serverMedia.hero
      : resolved.hero;

  const list: VillaGalleryItem[] = [];
  const hero = heroes.find(validImage) ?? villa.image;
  if (validImage(hero)) list.push({ name: "Main", image: hero as string });

  const cat = (
    serverMedia?.categorizedSpaces ||
    resolved.categorizedSpaces ||
    []
  )
    .map((g) => {
      const img = g.images?.find((x) => validImage(x));
      if (!img) return null;
      const title = g.title || g.category || "Space";
      return { name: title, image: img };
    })
    .filter(Boolean) as VillaGalleryItem[];

  if (cat.length > 0) {
    return [
      ...list,
      ...cat.map((x) => ({
        name: prettyMediaLabel({
          url: x.image,
          fallback: x.name,
          kind: "space",
        }),
        image: x.image,
      })),
    ];
  }

  const spaceSlides = resolved.spaces
    .filter((img) => validImage(img))
    .slice(0, 6)
    .map((img, i) => ({
      name: prettyMediaLabel({
        url: img,
        fallback: `Space ${i + 1}`,
        kind: "space",
      }),
      image: img,
    }));

  if (spaceSlides.length > 0) return list.concat(spaceSlides);
  if (list.length > 0) return list;
  return [{ name: "Main", image: villa.image || "" }];
}

export function primaryVillaListingImage(
  images: VillaGalleryItem[],
  fallback?: string,
) {
  return images.find((i) => validImage(i.image))?.image || fallback || "";
}
