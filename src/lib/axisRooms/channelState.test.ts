import { describe, expect, it } from "vitest";
import {
  deriveChannelState,
  CHANNEL_STATE_LABELS,
} from "@/lib/axisRooms/channelState";
import { isAxisRoomsMapped } from "@/lib/axisRooms/mapBooking";
import {
  formatPullRequestDate,
  normalizePullDate,
  normalizePullBookingRow,
  parsePullBookingPayload,
} from "@/lib/axisRooms/pullBooking";

describe("deriveChannelState", () => {
  it("returns website_only when mode is website_only", () => {
    expect(
      deriveChannelState({
        channelMode: "website_only",
        axisRooms: { propertyId: "1", roomTypeId: "2" },
      }),
    ).toBe("website_only");
  });

  it("returns awaiting_mapping when channel_managed but incomplete mapping", () => {
    expect(
      deriveChannelState({
        channelMode: "channel_managed",
        axisRooms: { propertyId: "1" },
      }),
    ).toBe("awaiting_mapping");
  });

  it("returns live when channel_managed and fully mapped", () => {
    expect(
      deriveChannelState({
        channelMode: "channel_managed",
        axisRooms: { propertyId: "1", roomTypeId: "2" },
      }),
    ).toBe("live");
  });
});

describe("isAxisRoomsMapped", () => {
  it("requires channel_managed mode", () => {
    expect(
      isAxisRoomsMapped({
        channelMode: "website_only",
        axisRooms: { propertyId: "1", roomTypeId: "2" },
      }),
    ).toBe(false);
  });

  it("returns true when channel_managed and mapped", () => {
    expect(
      isAxisRoomsMapped({
        channelMode: "channel_managed",
        axisRooms: { propertyId: "1", roomTypeId: "2" },
      }),
    ).toBe(true);
  });
});

describe("pull booking parser", () => {
  it("normalizes dd/MM/yyyy dates", () => {
    expect(normalizePullDate("21/03/2018")).toBe("2018-03-21");
    expect(normalizePullDate("21/03/2018 14:30:00")).toBe("2018-03-21");
  });

  it("formats pull request dates", () => {
    const d = new Date(Date.UTC(2018, 2, 21));
    expect(formatPullRequestDate(d)).toBe("21/03/2018");
  });

  it("parses pull payload into inbound events", () => {
    const row = normalizePullBookingRow({
      bookingNo: "BK-1",
      hotelId: "HT-01",
      checkInDateTime: "21/03/2018 14:00:00",
      checkOutDateTime: "23/03/2018 11:00:00",
      bookingStatus: "confirmed",
      ota: "Airbnb",
      guestName: "Test Guest",
      amount: "5000",
    });
    expect(row).toBeTruthy();

    const events = parsePullBookingPayload({
      bookings: [row],
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.propertyId).toBe("HT-01");
    expect(events[0]?.checkIn).toBe("2018-03-21");
    expect(events[0]?.channel).toBe("airbnb");
  });
});

describe("CHANNEL_STATE_LABELS", () => {
  it("has labels for all states", () => {
    expect(CHANNEL_STATE_LABELS.live).toContain("Live");
    expect(CHANNEL_STATE_LABELS.website_only).toContain("Website");
  });
});
