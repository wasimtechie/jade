/** Wedding page overlay — marketing fields only; pricing/stats merged at runtime. */
export type WeddingOverlayMeta = {
  onwardsPrice?: string;
  parking?: string;
};

export type WeddingVillaOverlayEntry = {
  id: string;
  type?: string;
  description?: string;
  perfectForTags?: string[];
  categories?: string[];
  overlay?: WeddingOverlayMeta;
};
