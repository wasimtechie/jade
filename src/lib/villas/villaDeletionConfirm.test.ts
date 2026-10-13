import { describe, expect, it } from "vitest";
import {
  villaDeleteConfirmLabel,
  villaDeleteNameMatches,
} from "./villaDeletionConfirm";

describe("villaDeletionConfirm", () => {
  it("uses shortName as the label to type", () => {
    expect(
      villaDeleteConfirmLabel({ name: "Saad Villa Bangalore", shortName: "Saad Villa" }),
    ).toBe("Saad Villa");
  });

  it("accepts either shortName or full name when typed", () => {
    const villa = { name: "Saad Villa Bangalore", shortName: "Saad Villa" };
    expect(villaDeleteNameMatches("Saad Villa", villa)).toBe(true);
    expect(villaDeleteNameMatches("Saad Villa Bangalore", villa)).toBe(true);
    expect(villaDeleteNameMatches("saad villa", villa)).toBe(false);
  });
});
