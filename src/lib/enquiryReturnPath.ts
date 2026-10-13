import type { OccasionOption } from "@/lib/enquiryFormOptions";

/** Main experiences hub — Enquire success OKAY always returns here. */
export const ENQUIRY_SUCCESS_RETURN_PATH = "/experiences";

/** Individual experience landing pages (CTA context / future use). */
export const EXPERIENCE_PAGE_PATHS = {
  weekendGetaways: "/weekend-getaways",
  partyVillas: "/party-villas",
  weddings: "/weddings",
  corporateRetreats: "/corporate-retreats",
  caravans: "/caravans",
} as const;

export type ExperiencePagePath =
  (typeof EXPERIENCE_PAGE_PATHS)[keyof typeof EXPERIENCE_PAGE_PATHS];

const EXPERIENCE_LANDING_PREFIXES: readonly ExperiencePagePath[] =
  Object.values(EXPERIENCE_PAGE_PATHS);

export function isExperienceLandingPath(pathname: string): boolean {
  return EXPERIENCE_LANDING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getExperienceEnquiryReturnPath(
  pathname: string,
  search = "",
): string | null {
  if (!isExperienceLandingPath(pathname)) return null;
  return `${pathname}${search}`;
}

/**
 * Success OKAY: return to the experience page when Enquire was opened from one;
 * otherwise the main experiences hub.
 */
export function resolveEnquiryOkayReturnPath(
  experienceReturnPath?: string | null,
): string {
  if (
    experienceReturnPath &&
    isExperienceLandingPath(experienceReturnPath)
  ) {
    return experienceReturnPath;
  }
  return ENQUIRY_SUCCESS_RETURN_PATH;
}

/** @deprecated Occasion mapping kept for reference; OKAY uses hub only. */
export const OCCASION_TO_EXPERIENCE_PATH: Partial<
  Record<OccasionOption, ExperiencePagePath>
> = {
  "Weekend Getaways": EXPERIENCE_PAGE_PATHS.weekendGetaways,
  Wedding: EXPERIENCE_PAGE_PATHS.weddings,
  "Corporate offsite": EXPERIENCE_PAGE_PATHS.corporateRetreats,
  "Birthday / celebration": EXPERIENCE_PAGE_PATHS.partyVillas,
  Anniversary: EXPERIENCE_PAGE_PATHS.partyVillas,
};
