import { describe, expect, it } from "vitest";
import {
  formatInrFromPaise,
  formatPricingDeltaLabel,
  formatStayRange,
} from "./dateChangeEmail";

describe("formatInrFromPaise", () => {
  it("formats paise as INR", () => {
    expect(formatInrFromPaise(100_000)).toBe("₹1,000");
  });
});

describe("formatPricingDeltaLabel", () => {
  it("returns undefined when totals are unchanged", () => {
    expect(formatPricingDeltaLabel(50_000, 50_000)).toBeUndefined();
  });

  it("labels an increase", () => {
    expect(formatPricingDeltaLabel(100_000, 150_000)).toBe(
      "+₹500 (increase)",
    );
  });

  it("labels a decrease", () => {
    expect(formatPricingDeltaLabel(150_000, 100_000)).toBe(
      "−₹500 (decrease)",
    );
  });
});

describe("formatStayRange", () => {
  it("joins check-in and check-out", () => {
    expect(formatStayRange("2026-07-10", "2026-07-13")).toBe(
      "2026-07-10 → 2026-07-13",
    );
  });
});
