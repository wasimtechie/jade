import { describe, expect, it } from "vitest";
import { createVillaSchema } from "./adminVilla";
import { normalizeVillaSlug } from "./villaIds";

describe("normalizeVillaSlug", () => {
  it("converts underscores to hyphens", () => {
    expect(normalizeVillaSlug("saad_banglore_v1")).toBe("saad-banglore-v1");
  });
});

describe("createVillaSchema", () => {
  it("accepts retreat id with underscores after normalize", () => {
    const parsed = createVillaSchema.safeParse({
      slug: "saad",
      retreatId: "saad_banglore_v1",
      name: "Saad Villa",
      shortName: "Saad Villa",
      status: "maintenance",
      bookable: false,
      content: {},
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.retreatId).toBe("saad-banglore-v1");
    }
  });
});
