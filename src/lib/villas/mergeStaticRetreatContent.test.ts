import { describe, expect, it } from "vitest";
import { mergeStaticRetreatContent } from "./mergeStaticRetreatContent";

describe("mergeStaticRetreatContent", () => {
  it("fills empty mongo content from static diamond retreat", () => {
    const merged = mergeStaticRetreatContent("diamond", {});

    expect(merged.description).toContain("Diamond Pavilion");
    expect(merged.perfectForTags).toEqual(
      expect.arrayContaining(["Events & Celebrations", "Grand Weddings"]),
    );
    expect(merged.amenities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Private Pool" }),
      ]),
    );
  });

  it("keeps mongo overrides when present", () => {
    const merged = mergeStaticRetreatContent("diamond", {
      description: "Custom admin description",
      socialProof: "Trusted by 500+ guests",
    });

    expect(merged.description).toBe("Custom admin description");
    expect(merged.socialProof).toBe("Trusted by 500+ guests");
    expect(merged.perfectForTags).toEqual(
      expect.arrayContaining(["Events & Celebrations"]),
    );
  });

  it("returns mongo-only content for unknown retreat ids", () => {
    const merged = mergeStaticRetreatContent("unknown-villa", {
      description: "Only mongo",
    });

    expect(merged.description).toBe("Only mongo");
  });
});
