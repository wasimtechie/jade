"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildVillaListingImages,
  primaryVillaListingImage,
  type VillaListingImagesInput,
  type VillaListingServerMedia,
} from "@/lib/villaListingImagesCore";

export type { VillaListingImagesInput, VillaListingServerMedia } from "@/lib/villaListingImagesCore";
export {
  buildVillaListingImages,
  primaryVillaListingImage,
} from "@/lib/villaListingImagesCore";

export function useVillaListingImages(
  villa: VillaListingImagesInput | null | undefined,
) {
  const [serverMedia, setServerMedia] = useState<VillaListingServerMedia | null>(
    null,
  );

  useEffect(() => {
    if (!villa?.id) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/villas/${villa!.id}/media?v=4`);
        if (!res.ok) return;
        const data = (await res.json()) as VillaListingServerMedia;
        if (!cancelled) setServerMedia(data);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [villa?.id]);

  const images = useMemo(
    () => buildVillaListingImages(villa, serverMedia),
    [villa, serverMedia],
  );

  const primaryImage = primaryVillaListingImage(images, villa?.image);

  return { images, primaryImage, serverMedia };
}
