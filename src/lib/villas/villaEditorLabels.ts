/** Villa editor labels aligned with public villa detail sections. */

export const WIZARD_STEPS = [
  { id: "listing", label: "Listing & publish", shortLabel: "Listing", publicSection: "Villa card" },
  { id: "hero", label: "Hero", shortLabel: "Hero", publicSection: "Hero carousel" },
  { id: "overview", label: "Overview", shortLabel: "Overview", publicSection: "#overview" },
  { id: "spaces", label: "Spaces", shortLabel: "Spaces", publicSection: "#spaces" },
  { id: "experiences", label: "Experiences", shortLabel: "Experiences", publicSection: "#experiences" },
  { id: "details", label: "Property details", shortLabel: "Details", publicSection: "#details" },
  { id: "video", label: "Video walkthrough", shortLabel: "Video", publicSection: "#video-walkthrough" },
  { id: "services", label: "Services", shortLabel: "Services", publicSection: "#services" },
  { id: "amenities", label: "Amenities", shortLabel: "Amenities", publicSection: "#amenities" },
  { id: "perfect-for", label: "Perfect for", shortLabel: "Perfect", publicSection: "#perfect-for" },
  { id: "location", label: "Location", shortLabel: "Location", publicSection: "#location" },
  { id: "faq", label: "FAQ", shortLabel: "FAQ", publicSection: "#faq" },
  { id: "pricing", label: "Pricing & capacity", shortLabel: "Pricing", publicSection: "#pricing" },
] as const;

export const WIZARD_FINAL_STEP = WIZARD_STEPS.length - 1;

export const QUICK_EDIT_SECTIONS = {
  identity: { title: "Identity", badge: "Villa card" },
  pricing: { title: "Pricing", badge: "Pricing" },
  stats: { title: "Public card stats", badge: "/retreats/" },
  visibility: { title: "Visibility & booking", badge: "Listing" },
  wedding: { title: "Wedding tiers", badge: "Perfect For" },
  addons: { title: "Add-ons", badge: "Booking" },
  policies: { title: "Policies", badge: "FAQ" },
} as const;

export type FieldLabelDef = {
  label: string;
  hint?: string;
  publicSection?: string;
  validateKey?: string;
};

export const FIELD_LABELS = {
  name: {
    label: "Villa name",
    hint: "Full name shown on the detail page hero",
    publicSection: "Hero",
    validateKey: "name",
  },
  shortName: {
    label: "Short name",
    hint: "Compact label for cards and navigation",
    publicSection: "Villa card",
    validateKey: "shortName",
  },
  slug: {
    label: "URL slug",
    hint: "Used in /retreat/your-slug/",
    validateKey: "slug",
  },
  retreatId: {
    label: "Retreat ID",
    hint: "Internal portfolio identifier",
    validateKey: "retreatId",
  },
  type: {
    label: "Property type",
    hint: "e.g. Luxury Villa, Estate",
    publicSection: "Hero",
    validateKey: "type",
  },
  location: {
    label: "Location label",
    hint: "City or region shown on cards",
    publicSection: "Location",
    validateKey: "location",
  },
  thumbnail: {
    label: "Primary hero image",
    hint: "Main slide in the detail page hero carousel",
    publicSection: "Hero carousel",
    validateKey: "thumbnail",
  },
  heroGallery: {
    label: "Additional hero slides",
    hint: "Optional extra carousel images. Custom properties show only these + primary image.",
    publicSection: "Hero carousel",
  },
  socialProof: {
    label: "Social proof line",
    hint: "Trust signal under the villa name on the detail page",
    publicSection: "#overview",
  },
  basePriceRupees: {
    label: "Overnight stay price (₹)",
    hint: "Base rate before tax and extras",
    publicSection: "Pricing",
    validateKey: "basePriceRupees",
  },
  dayOutBasePriceRupees: {
    label: "Day-out price (₹)",
    hint: "Day package base rate",
    publicSection: "Pricing",
    validateKey: "dayOutBasePriceRupees",
  },
  stayBasePax: {
    label: "Stay included guests",
    hint: "Guests covered by base stay price",
    publicSection: "Pricing",
    validateKey: "stayBasePax",
  },
  stayMaxPax: {
    label: "Maximum stay guests",
    hint: "Hard cap for overnight bookings",
    publicSection: "Pricing",
    validateKey: "stayMaxPax",
  },
  dayOutBasePax: {
    label: "Day-out included guests",
    publicSection: "Pricing",
    validateKey: "dayOutBasePax",
  },
  extraPaxStayRupees: {
    label: "Extra guest stay (₹/night)",
    publicSection: "Pricing",
    validateKey: "extraPaxStayRupees",
  },
  extraPaxDayOutRupees: {
    label: "Extra guest day-out (₹)",
    publicSection: "Pricing",
    validateKey: "extraPaxDayOutRupees",
  },
  taxPercent: {
    label: "Tax %",
    publicSection: "Pricing",
    validateKey: "taxPercent",
  },
  checkInTime: { label: "Check-in time", validateKey: "checkInTime" },
  checkOutTime: { label: "Check-out time", validateKey: "checkOutTime" },
  cancellationPolicy: {
    label: "Cancellation policy",
    publicSection: "FAQ",
    validateKey: "cancellationPolicy",
  },
  youtubeUrl: {
    label: "YouTube URL",
    hint: "Video walkthrough embed",
    publicSection: "Video Walkthrough",
    validateKey: "content.video.youtubeUrl",
  },
  videoDuration: {
    label: "Video duration",
    hint: "e.g. 2:45",
    publicSection: "Video Walkthrough",
  },
  intro: {
    label: "Overview intro",
    publicSection: "Hero",
    validateKey: "content.intro",
  },
  description: {
    label: "Full description",
    publicSection: "Hero",
    validateKey: "content.description",
  },
} as const satisfies Record<string, FieldLabelDef>;

export const DISPLAY_STAT_FIELD_LABELS: Record<string, string> = {
  stay: "Stay capacity",
  events: "Event capacity",
  bhk: "Bedrooms / layout",
  lawn: "Lawn / outdoor",
  villaArea: "Built-up / estate",
  pool: "Pool (if any)",
};

export function fieldLabel(key: keyof typeof FIELD_LABELS): FieldLabelDef {
  return FIELD_LABELS[key];
}

export function wizardStepLabel(index: number): string {
  return WIZARD_STEPS[index]?.label ?? `Step ${index + 1}`;
}

export function wizardStepBadge(index: number): string | undefined {
  return WIZARD_STEPS[index]?.publicSection;
}
