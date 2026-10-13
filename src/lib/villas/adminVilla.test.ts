import { describe, expect, it } from "vitest";
import { applyVillaUpdate } from "./adminVilla";

function villaFixture() {
  return {
    name: "Diamond Pavilion",
    shortName: "Diamond",
    type: "Estate",
    location: "Bangalore",
    thumbnail: "/old.webp",
    basePricePaise: 10_000_000,
    dayOutBasePricePaise: 5_000_000,
    stayBasePax: 10,
    dayOutBasePax: 20,
    stayMaxPax: 30,
    extraPaxStayPaise: 200_000,
    extraPaxDayOutPaise: 100_000,
    weddingVenue: false,
    weddingTiers: [],
    addOnAvailability: [],
    displayStats: { stay: "Up to 10 guests", bhk: "5 BHK" },
    settings: {
      taxPercent: 18,
      cleaningFeePaise: 0,
      securityDepositPaise: 0,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      cancellationPolicy: "",
    },
    depositPercent: 0,
    status: "active",
    bookable: true,
    content: {
      description: "Original coded description",
      amenities: [{ label: "Pool", icon: "Waves" }],
    },
  };
}

describe("applyVillaUpdate", () => {
  it("persists Quick Edit operational changes to Mongo shape", () => {
    const villa = villaFixture();
    applyVillaUpdate(villa, {
      shortName: "Diamond Updated",
      basePriceRupees: 125_000,
      stayBasePax: 12,
      displayStats: { stay: "Up to 12 guests" },
    });

    expect(villa.shortName).toBe("Diamond Updated");
    expect(villa.basePricePaise).toBe(12_500_000);
    expect(villa.stayBasePax).toBe(12);
    expect(villa.displayStats?.stay).toBe("Up to 12 guests");
    expect(villa.content?.description).toBe("Original coded description");
  });

  it("merges Full Editor content without wiping untouched fields", () => {
    const villa = villaFixture();
    applyVillaUpdate(villa, {
      content: {
        description: "Dashboard-authored description",
        faq: [{ question: "Pets?", answer: "On request" }],
      },
      basePriceRupees: 99_000,
    });

    expect(villa.content?.description).toBe("Dashboard-authored description");
    expect(villa.content?.amenities).toEqual([{ label: "Pool", icon: "Waves" }]);
    expect(villa.basePricePaise).toBe(9_900_000);
  });

  it("persists channelMode for OTA gating", () => {
    const villa = { ...villaFixture(), channelMode: "website_only" as const };
    applyVillaUpdate(villa, { channelMode: "channel_managed" });
    expect(villa.channelMode).toBe("channel_managed");
  });
});
