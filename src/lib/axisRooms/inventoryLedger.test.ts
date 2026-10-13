import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ connectDB: vi.fn() }));

const store = new Map<string, { free: number; inventoryUnits: number }>();

vi.mock("@/models/AxisNightInventory", () => ({
  AxisNightInventoryModel: {
    findOne: vi.fn(async (q: { hotelId: string; roomId: string; date: string }) => {
      const key = `${q.hotelId}|${q.roomId}|${q.date}`;
      const row = store.get(key);
      return row ? { free: row.free, inventoryUnits: row.inventoryUnits } : null;
    }),
    findOneAndUpdate: vi.fn(
      async (
        q: { hotelId: string; roomId: string; date: string },
        update: { $set: { free: number; inventoryUnits: number } },
      ) => {
        const key = `${q.hotelId}|${q.roomId}|${q.date}`;
        store.set(key, {
          free: update.$set.free,
          inventoryUnits: update.$set.inventoryUnits,
        });
        return { free: update.$set.free };
      },
    ),
  },
}));

import { applyInventoryDelta } from "./inventoryLedger";

describe("applyInventoryDelta", () => {
  beforeEach(() => {
    store.clear();
  });

  it("reduces 10 → 9 → 8 on successive bookings", async () => {
    const first = await applyInventoryDelta({
      hotelId: "1234",
      roomId: "2",
      checkIn: "2026-09-26",
      checkOut: "2026-09-28",
      delta: -1,
      inventoryUnits: 10,
    });
    expect(first.availability).toBe(9);

    const second = await applyInventoryDelta({
      hotelId: "1234",
      roomId: "2",
      checkIn: "2026-09-26",
      checkOut: "2026-09-28",
      delta: -1,
      inventoryUnits: 10,
    });
    expect(second.availability).toBe(8);
  });

  it("restores on cancel", async () => {
    await applyInventoryDelta({
      hotelId: "1234",
      roomId: "2",
      checkIn: "2026-09-26",
      checkOut: "2026-09-27",
      delta: -1,
      inventoryUnits: 10,
    });
    const restored = await applyInventoryDelta({
      hotelId: "1234",
      roomId: "2",
      checkIn: "2026-09-26",
      checkOut: "2026-09-27",
      delta: 1,
      inventoryUnits: 10,
    });
    expect(restored.availability).toBe(10);
  });
});
