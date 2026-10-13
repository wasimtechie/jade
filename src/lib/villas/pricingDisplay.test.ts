import { describe, expect, it } from "vitest";
import { buildPricingDisplayFromMongo, resolveOperationalPricing } from "./pricingDisplay";

describe("resolveOperationalPricing", () => {
  it("uses Mongo rates after Quick Edit / dashboard save", () => {
    const pricing = resolveOperationalPricing({
      basePricePaise: 12_500_000,
      dayOutBasePricePaise: 6_000_000,
      stayBasePax: 12,
      dayOutBasePax: 25,
      extraPaxStayPaise: 250_000,
      extraPaxDayOutPaise: 120_000,
      settings: { taxPercent: 18 },
    });

    expect(pricing.stay.packages[0].price).toContain("1,25,000");
    expect(pricing.stay.packages[0].label).toContain("12");
  });

  it("reflects custom tax percent from dashboard", () => {
    const pricing = buildPricingDisplayFromMongo({
      basePricePaise: 10_000_000,
      dayOutBasePricePaise: 0,
      stayBasePax: 10,
      dayOutBasePax: 20,
      settings: { taxPercent: 5 },
    });

    expect(pricing.stay.packages[0].price).toContain("GST (5%)");
  });

  it("shows wedding tiers saved from Full Editor step 13", () => {
    const pricing = buildPricingDisplayFromMongo({
      basePricePaise: 10_000_000,
      dayOutBasePricePaise: 5_000_000,
      stayBasePax: 10,
      dayOutBasePax: 20,
      weddingVenue: true,
      weddingTiers: [
        { label: "Half Day", maxGuests: 200, pricePaise: 15_000_000 },
      ],
    });

    expect(pricing.event.title).toBe("Wedding & Events");
    expect(pricing.event.packages[0].price).toContain("1,50,000");
  });
});
