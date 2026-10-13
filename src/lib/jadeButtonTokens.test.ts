import { describe, expect, it } from "vitest";
import {
  JADE_BTN_HEIGHT,
  JADE_BTN_SECTION_CLASS,
  JADE_BTN_WIDTH_FORM,
  JADE_BTN_WIDTH_SECTION,
  jadeButtonVariantClass,
  jadeButtonWidthClass,
} from "@/lib/jadeButtonTokens";

describe("jadeButtonTokens", () => {
  it("standardizes CTA height at 48px", () => {
    expect(JADE_BTN_HEIGHT).toContain("h-[48px]");
    expect(JADE_BTN_HEIGHT).toContain("min-h-[48px]");
    expect(JADE_BTN_HEIGHT).toContain("py-0");
  });

  it("maps width profiles", () => {
    expect(jadeButtonWidthClass("form")).toBe(JADE_BTN_WIDTH_FORM);
    expect(jadeButtonWidthClass("section")).toBe(JADE_BTN_WIDTH_SECTION);
    expect(jadeButtonWidthClass("auto")).toBe("");
  });

  it("maps primary and secondary variants", () => {
    expect(jadeButtonVariantClass("primary")).toContain("bg-jade-gold");
    expect(jadeButtonVariantClass("secondary")).toContain("border-white/10");
    expect(jadeButtonVariantClass("primary", true)).toContain(
      "pointer-events-none",
    );
  });

  it("composes section CTA class with 48px height", () => {
    expect(JADE_BTN_SECTION_CLASS).toContain("w-full");
    expect(JADE_BTN_SECTION_CLASS).toContain("md:w-auto");
    expect(JADE_BTN_SECTION_CLASS).toContain("px-8");
    expect(JADE_BTN_SECTION_CLASS).toContain("h-[48px]");
    expect(JADE_BTN_SECTION_CLASS).toContain("md:min-w-[22rem]");
  });
});
