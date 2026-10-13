import {
  buildVillaListingImages,
  type VillaGalleryItem,
} from "@/lib/villaListingImagesCore";

export type { VillaGalleryItem };

/** Manifest-only gallery (no API). Prefer `useVillaListingImages` for listing parity with `/retreats/`. */
export function buildVillaGalleryItems(villa: any, max = 8): VillaGalleryItem[] {
  const items = buildVillaListingImages(
    villa?.id
      ? { id: villa.id, name: villa.name, image: villa.image }
      : undefined,
  );
  return items.filter((i) => i.image).slice(0, max);
}

