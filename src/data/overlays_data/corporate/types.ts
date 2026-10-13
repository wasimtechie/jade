/** Corporate page overlay — marketing fields only; pricing/stats merged at runtime. */
export type CorporateOverlayMeta = {
  onwardsPrice?: string;
};

export type CorporateVillaOverlayEntry = {
  id: string;
  type?: string;
  description?: string;
  perfectForTags?: string[];
  categories?: string[];
  overlay?: CorporateOverlayMeta;
};
