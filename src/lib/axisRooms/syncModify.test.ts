import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ connectDB: vi.fn() }));
vi.mock("@/models/Booking", () => ({
  BookingModel: { findById: vi.fn() },
}));
vi.mock("./inventory", () => ({
  pushInventoryForRange: vi.fn(),
  pushBulkInventoryForRange: vi.fn(),
}));
vi.mock("./http", () => ({
  postAxisRoomsApi: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock("@/lib/audit/auditLog", () => ({
  auditLog: vi.fn(),
}));
vi.mock("./mapBooking", () => ({
  isAxisRoomsMapped: vi.fn(() => true),
  villaAxisRoomsMapping: vi.fn(() => ({
    propertyId: "hotel1",
    roomTypeId: "room1",
    ratePlanId: "rate1",
    inventoryUnits: 1,
  })),
}));
vi.mock("./inventoryLedger", () => ({
  applyInventoryDelta: vi.fn().mockResolvedValue({
    availability: 0,
    nights: [
      { date: "2026-10-21", free: 1 },
      { date: "2026-10-24", free: 0 },
      { date: "2026-10-25", free: 0 },
    ],
  }),
}));
vi.mock("@/models/Villa", () => ({
  VillaModel: { findById: vi.fn() },
}));

import { BookingModel } from "@/models/Booking";
import { VillaModel } from "@/models/Villa";
import {
  pushInventoryForRange,
  pushBulkInventoryForRange,
} from "./inventory";
import { postAxisRoomsApi } from "./http";
import {
  syncBookingInventoryModify,
  queueBookingInventoryModify,
} from "./sync";

const bookingBase = {
  _id: "booking1",
  villaId: "villa1",
  checkIn: "2026-10-24",
  checkOut: "2026-10-26",
  status: "confirmed",
  source: "admin_manual",
  axisRoomsSynced: true,
};

describe("syncBookingInventoryModify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VillaModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "villa1", axisRooms: {} }),
    } as never);
    vi.mocked(pushInventoryForRange).mockResolvedValue({ ok: true });
    vi.mocked(pushBulkInventoryForRange).mockResolvedValue({ ok: true });
  });

  it("opens old nights then closes new nights via API 2 + API 1", async () => {
    const result = await syncBookingInventoryModify(
      bookingBase,
      "2026-10-21",
      "2026-10-22",
    );
    expect(result.ok).toBe(true);
    // old open + new close = 2 API2; daywise via postAxisRoomsApi when nights provided
    expect(pushBulkInventoryForRange).toHaveBeenCalledTimes(2);
    expect(postAxisRoomsApi).toHaveBeenCalled();
  });

  it("skips outbound for OTA bookings", async () => {
    const result = await syncBookingInventoryModify(
      { ...bookingBase, source: "axisrooms_airbnb" },
      "2026-10-21",
      "2026-10-22",
    );
    expect(result.ok).toBe(true);
    expect(pushBulkInventoryForRange).not.toHaveBeenCalled();
    expect(pushInventoryForRange).not.toHaveBeenCalled();
  });

  it("skips axis push for pending without prior sync", async () => {
    const result = await syncBookingInventoryModify(
      { ...bookingBase, status: "pending", axisRoomsSynced: false },
      "2026-10-21",
      "2026-10-22",
    );
    expect(result.ok).toBe(true);
    expect(pushBulkInventoryForRange).not.toHaveBeenCalled();
    expect(pushInventoryForRange).not.toHaveBeenCalled();
  });
});

describe("queueBookingInventoryModify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BookingModel.findById).mockResolvedValue({
      ...bookingBase,
      save: vi.fn(),
    } as never);
    vi.mocked(VillaModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "villa1", axisRooms: {} }),
    } as never);
    vi.mocked(pushInventoryForRange).mockResolvedValue({ ok: true });
    vi.mocked(pushBulkInventoryForRange).mockResolvedValue({ ok: true });
  });

  it("loads booking and runs modify sync", async () => {
    const result = await queueBookingInventoryModify("booking1", {
      checkIn: "2026-10-21",
      checkOut: "2026-10-22",
    });
    expect(result.ok).toBe(true);
    expect(BookingModel.findById).toHaveBeenCalledWith("booking1");
  });
});
