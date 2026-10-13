import { describe, expect, it } from "vitest";
import {
  EXPERIENCE_SECTION_CTA_BUTTON_CLASS,
  EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
  EXPERIENCE_SECTION_CTA_DIMENSIONS_MD,
} from "@/lib/experienceSectionCta";

describe("experienceSectionCta tokens", () => {
  it("keeps full-width 48px height on mobile", () => {
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("w-full");
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("md:w-auto");
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("px-8");
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("h-[48px]");
  });

  it("standardizes desktop padding and min-width", () => {
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("md:px-10");
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("lg:px-12");
    expect(EXPERIENCE_SECTION_CTA_BUTTON_CLASS).toContain("md:min-w-[22rem]");
  });

  it("centers CTAs in a shared lane on desktop", () => {
    expect(EXPERIENCE_SECTION_CTA_CONTAINER_CLASS).toContain("flex");
    expect(EXPERIENCE_SECTION_CTA_CONTAINER_CLASS).toContain("justify-center");
    expect(EXPERIENCE_SECTION_CTA_CONTAINER_CLASS).toContain("md:max-w-xl");
  });

  it("aligns glass CTA dimensions at md+", () => {
    expect(EXPERIENCE_SECTION_CTA_DIMENSIONS_MD).toContain("md:min-w-[22rem]");
    expect(EXPERIENCE_SECTION_CTA_DIMENSIONS_MD).toContain("md:px-10");
  });
});
