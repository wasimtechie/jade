import { expandNightDates } from "@/lib/bookingDates";
import { auditLog } from "@/lib/audit/auditLog";
import { postAxisRoomsApi } from "./http";
import type { AxisRoomsPushResult } from "./types";

type InventoryPushParams = {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  /** Remaining free units for each night (0 = sold out). */
  free: number;
  auditTargetId?: string;
  auditTargetType?: string;
};

/** API 1 — push day-wise inventory for a date range (check-out exclusive). */
export async function pushInventoryForRange(
  params: InventoryPushParams,
): Promise<AxisRoomsPushResult> {
  const nights = expandNightDates(params.checkIn, params.checkOut);
  if (nights.length === 0) {
    return { ok: true };
  }

  const result = await postAxisRoomsApi("/api/daywiseInventory", {
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            availability: nights.map((date) => ({
              date,
              free: params.free,
            })),
          },
        ],
      },
    ],
  });

  await auditLog({
    action:
      params.free === 0
        ? "axisrooms.inventory.close"
        : "axisrooms.inventory.open",
    targetType: params.auditTargetType ?? "booking",
    targetId: params.auditTargetId,
    metadata: {
      hotelId: params.hotelId,
      roomId: params.roomId,
      nights: nights.length,
      dates: nights,
      free: params.free,
      api: 1,
      ok: result.ok,
      error: result.error,
    },
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

/** API 2 — bulk inventory for a date range (whole-unit villa: availability 1 = open). */
export async function pushBulkInventoryForRange(params: {
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  /** Units available per night across the range (1 for single-villa inventory) */
  availability: number;
  auditTargetId?: string;
  auditTargetType?: string;
}): Promise<AxisRoomsPushResult> {
  const result = await postAxisRoomsApi("/api/inventory", {
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            startDate: params.startDate,
            endDate: params.endDate,
            availability: params.availability,
          },
        ],
      },
    ],
  });

  await auditLog({
    action: "axisrooms.inventory.bulk",
    targetType: params.auditTargetType ?? "villa",
    targetId: params.auditTargetId,
    metadata: {
      hotelId: params.hotelId,
      roomId: params.roomId,
      startDate: params.startDate,
      endDate: params.endDate,
      availability: params.availability,
      api: 2,
      ok: result.ok,
      error: result.error,
    },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
