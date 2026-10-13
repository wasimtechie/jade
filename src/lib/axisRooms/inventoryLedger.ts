import { connectDB } from "@/lib/db";
import { expandNightDates } from "@/lib/bookingDates";
import { AxisNightInventoryModel } from "@/models/AxisNightInventory";

export type NightFree = { date: string; free: number };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Rohith CM flow (delta):
 * - confirm  → reduce free by noOfRooms for stay nights
 * - cancel   → restore free by noOfRooms
 * - modify   → restore old nights, reduce new nights
 *
 * Ledger remembers last known free so 10 → 9 → 8 stays correct even if
 * Jade booking history is incomplete.
 */
export async function applyInventoryDelta(params: {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  /** Negative to reduce (booking), positive to restore (cancel). */
  delta: number;
  inventoryUnits?: number;
}): Promise<{ nights: NightFree[]; availability: number }> {
  const units = Math.max(1, Math.floor(params.inventoryUnits ?? 1));
  const nights = expandNightDates(params.checkIn, params.checkOut);
  if (nights.length === 0) {
    return { nights: [], availability: units };
  }

  await connectDB();

  const delta = Math.trunc(params.delta);
  const result: NightFree[] = [];

  for (const date of nights) {
    const existing = await AxisNightInventoryModel.findOne({
      hotelId: params.hotelId,
      roomId: params.roomId,
      date,
    });

    const current =
      existing && Number.isFinite(existing.free) ? Number(existing.free) : units;
    const next = clamp(current + delta, 0, units);

    await AxisNightInventoryModel.findOneAndUpdate(
      { hotelId: params.hotelId, roomId: params.roomId, date },
      {
        $set: {
          free: next,
          inventoryUnits: units,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    result.push({ date, free: next });
  }

  const availability = Math.min(...result.map((n) => n.free));
  return { nights: result, availability };
}

/** Seed / reset free count for a date range (e.g. after Rohith asks push 10). */
export async function seedInventoryRange(params: {
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  free: number;
  inventoryUnits?: number;
}): Promise<NightFree[]> {
  const units = Math.max(1, Math.floor(params.inventoryUnits ?? 1));
  const free = clamp(Math.floor(params.free), 0, units);
  // Inclusive end for seed helper (caller passes last night or end date)
  const nights = expandNightDates(
    params.startDate,
    (() => {
      const d = new Date(`${params.endDate}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().slice(0, 10);
    })(),
  );

  await connectDB();
  const out: NightFree[] = [];
  for (const date of nights) {
    await AxisNightInventoryModel.findOneAndUpdate(
      { hotelId: params.hotelId, roomId: params.roomId, date },
      { $set: { free, inventoryUnits: units } },
      { upsert: true },
    );
    out.push({ date, free });
  }
  return out;
}

/** Read ledger without mutating (for diagnostics). */
export async function peekInventoryRange(params: {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  inventoryUnits?: number;
}): Promise<NightFree[]> {
  const units = Math.max(1, Math.floor(params.inventoryUnits ?? 1));
  const nights = expandNightDates(params.checkIn, params.checkOut);
  await connectDB();
  const out: NightFree[] = [];
  for (const date of nights) {
    const row = await AxisNightInventoryModel.findOne({
      hotelId: params.hotelId,
      roomId: params.roomId,
      date,
    }).lean();
    out.push({
      date,
      free: row && Number.isFinite(row.free) ? Number(row.free) : units,
    });
  }
  return out;
}
