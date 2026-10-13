import { describe, expect, it } from "vitest";
import { mergePublicText } from "./mergePublicFields";

describe("mergePublicText", () => {
  it("keeps static description when Mongo saved an empty string", () => {
    const staticDescription =
      "Jade 735 is a private boutique villa designed as a personal retreat within a resort-like setting.";

    expect(mergePublicText("", staticDescription)).toBe(staticDescription);
    expect(mergePublicText("   ", staticDescription)).toBe(staticDescription);
  });

  it("uses dashboard description when staff authored copy", () => {
    expect(
      mergePublicText("Updated from Full Editor", "Original static copy"),
    ).toBe("Updated from Full Editor");
  });
});
