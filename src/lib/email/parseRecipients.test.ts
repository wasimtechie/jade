import { describe, expect, it } from "vitest";
import { parseRecipients, firstRecipient } from "@/lib/email/parseRecipients";

describe("parseRecipients", () => {
  it("parses comma-separated emails", () => {
    expect(parseRecipients("a@x.com, b@x.com")).toEqual([
      "a@x.com",
      "b@x.com",
    ]);
  });

  it("parses semicolon-separated emails", () => {
    expect(parseRecipients("a@x.com; b@x.com")).toEqual(["a@x.com", "b@x.com"]);
  });

  it("dedupes and trims", () => {
    expect(parseRecipients(" A@X.com , a@x.com , invalid , c@x.com ")).toEqual([
      "a@x.com",
      "c@x.com",
    ]);
  });

  it("returns empty for blank", () => {
    expect(parseRecipients("")).toEqual([]);
    expect(parseRecipients(undefined)).toEqual([]);
  });
});

describe("firstRecipient", () => {
  it("returns first valid address", () => {
    expect(firstRecipient("ops@x.com, bookings@x.com")).toBe("ops@x.com");
  });
});
