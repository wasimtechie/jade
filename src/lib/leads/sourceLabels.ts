export const LEAD_SOURCES = [
  "general_enquiry",
  "weekend_getaways_enquiry",
  "wedding_enquiry",
  "party_villas_enquiry",
  "corporate_retreats_enquiry",
  "rathaa_enquiry",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  general_enquiry: "General enquiry",
  weekend_getaways_enquiry: "Weekend getaways",
  wedding_enquiry: "Wedding page",
  party_villas_enquiry: "Party villas",
  corporate_retreats_enquiry: "Corporate retreats",
  rathaa_enquiry: "Rathaa / caravans",
};

export function isLeadSource(value: unknown): value is LeadSource {
  return (
    typeof value === "string" &&
    (LEAD_SOURCES as readonly string[]).includes(value)
  );
}

export function leadSourceLabel(source: string): string {
  if (isLeadSource(source)) return LEAD_SOURCE_LABELS[source];
  return source.replace(/_/g, " ");
}

/** General overlay form (not wedding-specific payload). */
export function isGeneralLikeLeadSource(source: LeadSource): boolean {
  return source !== "wedding_enquiry";
}
