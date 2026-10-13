import { describe, expect, it } from "vitest";
import { assessVillaDeletion } from "./villaDeletion";

describe("assessVillaDeletion", () => {
  it("allows custom dashboard properties", () => {
    expect(
      assessVillaDeletion({
        slug: "saad-villa",
        retreatId: "saad-villa",
        portfolioSource: "custom",
      }),
    ).toEqual({ allowed: true });
  });

  it("blocks canonical portfolio properties", () => {
    const result = assessVillaDeletion({
      slug: "diamond",
      retreatId: "diamond",
      portfolioSource: "canonical",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/portfolio catalogue/i);
  });

  it("allows mongo-only villas without static retreat", () => {
    expect(
      assessVillaDeletion({
        slug: "one-off-estate",
        retreatId: "one-off-estate",
        portfolioSource: "canonical",
      }),
    ).toEqual({ allowed: true });
  });
});
