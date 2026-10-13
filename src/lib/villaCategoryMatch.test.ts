import { describe, expect, it } from "vitest";
import { spaceMatchesCategory, villaMatchesCategory } from "@/lib/villaCategoryMatch";

describe("villaMatchesCategory", () => {
  it("matches categories on the villa record", () => {
    expect(
      villaMatchesCategory(
        { categories: ["Luxury Stays", "Weekend Getaways"] },
        "Luxury Stays",
      ),
    ).toBe(true);
  });

  it("matches perfectForTags via alias map", () => {
    expect(
      villaMatchesCategory(
        {
          categories: ["Luxury Stays"],
          perfectForTags: ["Boutique Stays", "Family Gatherings"],
        },
        "Weekend Getaways",
      ),
    ).toBe(true);
  });

  it("matches perfectForCards titles", () => {
    expect(
      villaMatchesCategory(
        {
          perfectForCards: [{ title: "Corporate Outings", image: "" }],
        },
        "Corporate Retreats",
      ),
    ).toBe(true);
  });

  it("returns true for All", () => {
    expect(villaMatchesCategory({ categories: [] }, "All")).toBe(true);
  });

  it("matches Pet Friendly when tag is present", () => {
    expect(
      villaMatchesCategory({ categories: ["Pet Friendly"] }, "Pet Friendly"),
    ).toBe(true);
    expect(
      villaMatchesCategory({ categories: ["Weddings"] }, "Pet Friendly"),
    ).toBe(false);
  });

  it("excludes Palatio from Weddings tab", () => {
    expect(
      villaMatchesCategory(
        {
          id: "palatio",
          categories: ["Weddings", "Party Venues"],
          perfectForTags: ["Private Celebrations"],
        },
        "Weddings",
      ),
    ).toBe(false);
    expect(
      villaMatchesCategory(
        { id: "palatio", categories: ["Party Venues"] },
        "Party Venues",
      ),
    ).toBe(true);
  });
});

describe("spaceMatchesCategory", () => {
  it("matches case-insensitively", () => {
    expect(
      spaceMatchesCategory("Views & Exteriors", "views & exteriors"),
    ).toBe(true);
  });
});
