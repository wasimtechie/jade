/** Figma / weekend page label — used when opening Enquire from `/weekend-getaways`. */
export const WEEKEND_GETAWAYS_OCCASION = "Weekend Getaways" as const;

export const OCCASION_OPTIONS = [
  WEEKEND_GETAWAYS_OCCASION,
  "Wedding",
  "Corporate offsite",
  "Birthday / celebration",
  "Anniversary",
  "Other",
] as const;

export type OccasionOption = (typeof OCCASION_OPTIONS)[number];
