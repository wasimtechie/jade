import { describe, expect, it } from "vitest";
import { addDays, nightCount, rangesOverlap } from "./bookingDates";

describe("rangesOverlap", () => {
  it("same-day turnover: A checkOut === B checkIn → no conflict", () => {
    expect(rangesOverlap("2026-06-01", "2026-06-05", "2026-06-05", "2026-06-10")).toBe(
      false,
    );
  });

  it("overlapping ranges conflict", () => {
    expect(rangesOverlap("2026-06-01", "2026-06-05", "2026-06-04", "2026-06-10")).toBe(
      true,
    );
  });

  it("adjacent non-overlap", () => {
    expect(rangesOverlap("2026-06-01", "2026-06-03", "2026-06-03", "2026-06-05")).toBe(
      false,
    );
  });
});

describe("nightCount", () => {
  it("counts nights between check-in and exclusive check-out", () => {
    expect(nightCount("2026-06-01", "2026-06-05")).toBe(4);
  });
});

describe("addDays", () => {
  it("adds days to YYYY-MM-DD", () => {
    expect(addDays("2026-06-01", 1)).toBe("2026-06-02");
  });
});
