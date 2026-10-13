/**
 * Enquire overlay variants — separated by experience page context.
 * `enquireReturnPath` from AnimationContext selects copy, defaults, API source, OKAY target.
 */
import type { OccasionOption } from "@/lib/enquiryFormOptions";
import {
  ENQUIRY_SUCCESS_RETURN_PATH,
  EXPERIENCE_PAGE_PATHS,
  type ExperiencePagePath,
} from "@/lib/enquiryReturnPath";

export type EnquiryOverlayVariantId =
  | "default"
  | "weekend-getaways"
  | "party-villas"
  | "corporate-retreats"
  | "weddings";

export type EnquiryOverlayVariant = {
  id: EnquiryOverlayVariantId;
  leadSource: string;
  defaultOccasionType: OccasionOption | "";
  title: string;
  description: string;
  okayReturnPath: string;
};

const VARIANTS: Record<EnquiryOverlayVariantId, EnquiryOverlayVariant> = {
  "weekend-getaways": {
    id: "weekend-getaways",
    leadSource: "weekend_getaways_enquiry",
    defaultOccasionType: "Weekend Getaways",
    title: "Plan Your Weekend Getaway",
    description:
      "Share your dates and group size. Our team will help you choose the right private villa for a relaxed weekend escape.",
    okayReturnPath: EXPERIENCE_PAGE_PATHS.weekendGetaways,
  },
  "party-villas": {
    id: "party-villas",
    leadSource: "party_villas_enquiry",
    defaultOccasionType: "Birthday / celebration",
    title: "Plan Your Celebration",
    description:
      "Tell us your celebration date, guest count, and vibe. We will match you with the right party villa and curated add-ons.",
    okayReturnPath: EXPERIENCE_PAGE_PATHS.partyVillas,
  },
  "corporate-retreats": {
    id: "corporate-retreats",
    leadSource: "corporate_retreats_enquiry",
    defaultOccasionType: "Corporate offsite",
    title: "Plan Your Corporate Retreat",
    description:
      "Share your team size, agenda, and dates. Our team will recommend the right private venue for your offsite or retreat.",
    okayReturnPath: EXPERIENCE_PAGE_PATHS.corporateRetreats,
  },
  weddings: {
    id: "weddings",
    leadSource: "wedding_enquiry",
    defaultOccasionType: "Wedding",
    title: "Plan Your Wedding",
    description:
      "Share your celebration dates, guest count, and vision. We will help you find the right Jade venue for your wedding journey.",
    okayReturnPath: EXPERIENCE_PAGE_PATHS.weddings,
  },
  default: {
    id: "default",
    leadSource: "general_enquiry",
    defaultOccasionType: "",
    title: "Enquire Now",
    description:
      "Tell us your preferred dates, group size, and occasion. Our team will help you design a curated luxury experience.",
    okayReturnPath: ENQUIRY_SUCCESS_RETURN_PATH,
  },
};

const PATH_TO_VARIANT: Record<ExperiencePagePath, EnquiryOverlayVariantId> = {
  [EXPERIENCE_PAGE_PATHS.weekendGetaways]: "weekend-getaways",
  [EXPERIENCE_PAGE_PATHS.partyVillas]: "party-villas",
  [EXPERIENCE_PAGE_PATHS.corporateRetreats]: "corporate-retreats",
  [EXPERIENCE_PAGE_PATHS.weddings]: "weddings",
  [EXPERIENCE_PAGE_PATHS.caravans]: "default",
};

function normalizeEnquiryReturnPath(returnPath: string | null): string | null {
  if (!returnPath) return null;
  const path = returnPath.split("?")[0].replace(/\/$/, "") || "/";
  return path;
}

export function resolveEnquiryVariantId(
  returnPath: string | null,
): EnquiryOverlayVariantId {
  const path = normalizeEnquiryReturnPath(returnPath);
  if (!path) return "default";

  for (const [experiencePath, variantId] of Object.entries(PATH_TO_VARIANT)) {
    if (path === experiencePath || path.startsWith(`${experiencePath}/`)) {
      return variantId;
    }
  }

  return "default";
}

export function getEnquiryOverlayVariant(
  returnPath: string | null,
): EnquiryOverlayVariant {
  return VARIANTS[resolveEnquiryVariantId(returnPath)];
}
