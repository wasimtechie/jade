import { describe, expect, it } from "vitest";
import { slugForRetreatId } from "./canonicalPortfolio";

describe("slugForRetreatId", () => {
  it("maps retreat ids used by the public site to booking slugs", () => {
    expect(slugForRetreatId("dome-villas-blue")).toBe("blue-dome");
    expect(slugForRetreatId("dome-villas-red")).toBe("red-dome");
    expect(slugForRetreatId("dome-villas-yellow")).toBe("yellow-dome");
  });

  it("returns undefined for unknown retreat ids", () => {
    expect(slugForRetreatId("unknown-villa")).toBeUndefined();
  });
});
