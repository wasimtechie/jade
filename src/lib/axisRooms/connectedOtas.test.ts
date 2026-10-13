import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchConnectedOtas } from "@/lib/axisRooms/connectedOtas";

vi.mock("@/lib/axisRooms/config", () => ({
  getAxisRoomsChannelId: () => "227",
}));

vi.mock("@/lib/axisRooms/http", () => ({
  getAxisRoomsApi: vi.fn(),
}));

import { getAxisRoomsApi } from "@/lib/axisRooms/http";

describe("fetchConnectedOtas", () => {
  beforeEach(() => {
    vi.mocked(getAxisRoomsApi).mockReset();
  });

  it("maps channel list from API 13 response", async () => {
    vi.mocked(getAxisRoomsApi).mockResolvedValue({
      ok: true,
      data: {
        channels: [
          { channelId: 2, channelName: "Booking.com" },
          { channelId: 9, channelName: "Airbnb" },
        ],
      },
    });

    const result = await fetchConnectedOtas();
    expect(result.ok).toBe(true);
    expect(result.otas).toHaveLength(2);
    expect(result.otas[0]).toEqual({
      channelId: 2,
      channelName: "Booking.com",
    });
  });

  it("returns error when API fails", async () => {
    vi.mocked(getAxisRoomsApi).mockResolvedValue({
      ok: false,
      error: "not configured",
    });

    const result = await fetchConnectedOtas();
    expect(result.ok).toBe(false);
    expect(result.otas).toHaveLength(0);
  });
});
