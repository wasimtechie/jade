import { describe, expect, it } from "vitest";
import { computeBookingPricing, type VillaPricingInput } from "./pricing";

const villa: VillaPricingInput = {
  slug: "jade-735",
  basePricePaise: 1_000_000,
  dayOutBasePricePaise: 500_000,
  stayBasePax: 4,
  dayOutBasePax: 4,
  stayMaxPax: 10,
  extraPaxStayPaise: 100_000,
  extraPaxDayOutPaise: 50_000,
  settings: {
    taxPercent: 18,
    cleaningFeePaise: 0,
    securityDepositPaise: 0,
  },
};

describe("computeBookingPricing add-on allowlist", () => {
  it("rejects add-ons outside villa-configured availability", () => {
    const result = computeBookingPricing({
      villa,
      bookingType: "stay",
      checkIn: "2026-08-01",
      checkOut: "2026-08-03",
      guests: 4,
      adults: 4,
      addOns: [{ id: "picnic-setup", quantity: 1 }],
      allowedAddOnIds: ["rooftop-jacuzzi"],
    });

    expect(result.errors).toEqual([
      {
        code: "ADDON_NOT_AVAILABLE",
        message: "picnic-setup not available for this villa",
      },
    ]);
    expect(result.pricing.addOnPaise).toBe(0);
  });

  it("still allows legacy slug-based matching when no allowlist is configured", () => {
    const result = computeBookingPricing({
      villa,
      bookingType: "stay",
      checkIn: "2026-08-01",
      checkOut: "2026-08-03",
      guests: 4,
      adults: 4,
      addOns: [{ id: "rooftop-jacuzzi", quantity: 1 }],
    });

    expect(result.errors).toEqual([]);
    expect(result.pricing.addOnPaise).toBe(400_000);
  });
});
