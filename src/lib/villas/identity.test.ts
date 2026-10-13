import { describe, expect, it } from "vitest";
import {
  publicVillaIdForSlug,
  slugForPublicVillaId,
  villaIdentityCandidates,
} from "./identity";

describe("villa identity helpers", () => {
  it("maps public retreat ids to booking slugs", () => {
    expect(slugForPublicVillaId("dome-villas-blue")).toBe("blue-dome");
  });

  it("maps booking slugs back to public retreat ids", () => {
    expect(publicVillaIdForSlug("blue-dome")).toBe("dome-villas-blue");
  });

  it("builds candidates covering both public and operational ids", () => {
    expect(villaIdentityCandidates("blue-dome")).toEqual([
      "blue-dome",
      "dome-villas-blue",
    ]);
    expect(villaIdentityCandidates("dome-villas-blue")).toEqual([
      "dome-villas-blue",
      "blue-dome",
    ]);
  });
});
