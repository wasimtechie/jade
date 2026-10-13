import { describe, expect, it } from "vitest";
import {
  getEnquiryOverlayVariant,
  resolveEnquiryVariantId,
} from "@/lib/enquiryOverlayConfig";
import { EXPERIENCE_PAGE_PATHS } from "@/lib/enquiryReturnPath";
import { resolveEnquiryOkayReturnPath } from "@/lib/enquiryReturnPath";

describe("enquiryOverlayConfig", () => {
  it("uses weekend variant from weekend page path", () => {
    expect(resolveEnquiryVariantId(EXPERIENCE_PAGE_PATHS.weekendGetaways)).toBe(
      "weekend-getaways",
    );
    const v = getEnquiryOverlayVariant(EXPERIENCE_PAGE_PATHS.weekendGetaways);
    expect(v.defaultOccasionType).toBe("Weekend Getaways");
    expect(v.leadSource).toBe("weekend_getaways_enquiry");
    expect(v.title).toMatch(/Weekend/i);
  });

  it("uses party variant with pre-selected celebration occasion", () => {
    expect(resolveEnquiryVariantId(EXPERIENCE_PAGE_PATHS.partyVillas)).toBe(
      "party-villas",
    );
    const v = getEnquiryOverlayVariant(EXPERIENCE_PAGE_PATHS.partyVillas);
    expect(v.defaultOccasionType).toBe("Birthday / celebration");
    expect(v.title).toMatch(/Celebration/i);
  });

  it("uses corporate variant with corporate offsite occasion", () => {
    expect(
      resolveEnquiryVariantId(EXPERIENCE_PAGE_PATHS.corporateRetreats),
    ).toBe("corporate-retreats");
    const v = getEnquiryOverlayVariant(
      EXPERIENCE_PAGE_PATHS.corporateRetreats,
    );
    expect(v.defaultOccasionType).toBe("Corporate offsite");
    expect(v.title).toMatch(/Corporate/i);
  });

  it("uses wedding variant with wedding occasion", () => {
    expect(resolveEnquiryVariantId(EXPERIENCE_PAGE_PATHS.weddings)).toBe(
      "weddings",
    );
    const v = getEnquiryOverlayVariant(EXPERIENCE_PAGE_PATHS.weddings);
    expect(v.defaultOccasionType).toBe("Wedding");
    expect(v.title).toMatch(/Wedding/i);
  });

  it("normalizes return paths with query strings", () => {
    expect(
      resolveEnquiryVariantId(`${EXPERIENCE_PAGE_PATHS.partyVillas}?ref=cta`),
    ).toBe("party-villas");
  });

  it("OKAY returns to experience page when opened from weekend", () => {
    expect(
      resolveEnquiryOkayReturnPath(EXPERIENCE_PAGE_PATHS.weekendGetaways),
    ).toBe("/weekend-getaways");
  });

  it("OKAY falls back to experiences hub without context", () => {
    expect(resolveEnquiryOkayReturnPath(null)).toBe("/experiences");
  });
});
