import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ connectDB: vi.fn() }));
vi.mock("@/models/Villa", () => ({
  VillaModel: { find: vi.fn() },
}));

import { VillaModel } from "@/models/Villa";
import { validateAxisRoomsInbound } from "./validateInbound";
import type { AxisRoomsInboundEvent } from "./types";

const baseEvent: AxisRoomsInboundEvent = {
  eventType: "create",
  bookingNo: "ARK00002EM7R",
  bookingStatus: "confirmed",
  propertyId: "12123",
  roomTypeId: "2",
  ratePlanId: "2",
  noOfRooms: 1,
  checkIn: "2026-07-06",
  checkOut: "2026-07-07",
  raw: {},
};

describe("validateAxisRoomsInbound", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VillaModel.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    } as never);
  });

  it("rejects invalid roomType id", async () => {
    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      roomTypeId: "123",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNKNOWN_PROPERTY");
      expect(result.error).toContain("12123/123");
    }
  });

  it("rejects invalid ratePlanId when villa mapping has one", async () => {
    vi.mocked(VillaModel.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue([
        {
          _id: "villa1",
          name: "Test Villa",
          slug: "test",
          channelMode: "channel_managed",
          axisRooms: {
            propertyId: "12123",
            roomTypeId: "2",
            ratePlanId: "2",
          },
        },
      ]),
    } as never);

    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      ratePlanId: "99",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_RATE_PLAN");
    }
  });

  it("rejects noOfRooms other than 1", async () => {
    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      noOfRooms: 23,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_ROOM_COUNT");
    }
  });

  it("rejects unregistered hotelId", async () => {
    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      propertyId: "9999",
      roomTypeId: "1",
      ratePlanId: "1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNKNOWN_PROPERTY");
    }
  });

  it("rejects website_only channel mode", async () => {
    vi.mocked(VillaModel.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue([
        {
          _id: "villa1",
          name: "Test Villa",
          slug: "palatio",
          channelMode: "website_only",
          axisRooms: {
            propertyId: "1311",
            roomTypeId: "1",
            ratePlanId: "1",
          },
        },
      ]),
    } as never);

    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      propertyId: "1311",
      roomTypeId: "1",
      ratePlanId: "1",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_CHANNEL_MANAGED");
    }
  });

  it("accepts empty ratePlanId when villa has mapping", async () => {
    vi.mocked(VillaModel.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue([
        {
          _id: "villa1",
          name: "Red Dome",
          slug: "red-dome",
          channelMode: "channel_managed",
          axisRooms: {
            propertyId: "1303",
            roomTypeId: "1",
            ratePlanId: "1",
            ratePlanName: "Best Available Rate",
          },
        },
      ]),
    } as never);

    const result = await validateAxisRoomsInbound({
      ...baseEvent,
      propertyId: "1303",
      roomTypeId: "1",
      ratePlanId: undefined,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mapping.ratePlanId).toBe("1");
    }
  });
});
