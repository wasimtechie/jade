import { expandNightDates } from "@/lib/bookingDates";
import { auditLog } from "@/lib/audit/auditLog";
import { postAxisRoomsApi } from "./http";
import {
  pushBulkInventoryForRange,
  pushInventoryForRange,
} from "./inventory";
import type { AxisRoomsPushResult } from "./types";
import type { NightFree } from "./inventoryLedger";

export type StayInventoryPushParams = {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  bookingNo: string;
  bookingId?: string;
  /**
   * Remaining free units for the stay (min across nights).
   * Prefer `nights` when per-night values differ.
   */
  availability: number;
  /** Optional per-night free values (API 1). */
  nights?: NightFree[];
  auditTargetType?: string;
};

export function stayEndDate(checkIn: string, checkOut: string): string {
  const nights = expandNightDates(checkIn, checkOut);
  if (nights.length === 0) return checkIn;
  return nights[nights.length - 1]!;
}

/**
 * Canonical inventory push after booking save:
 * 1) API 2 bulk — one range using min remaining
 * 2) API 1 daywise — per-night free (Rohith CM contract)
 */
export async function pushStayInventoryToAxis(
  params: StayInventoryPushParams,
): Promise<AxisRoomsPushResult> {
  const nightDates = expandNightDates(params.checkIn, params.checkOut);
  if (nightDates.length === 0) {
    return { ok: true };
  }

  const endDate = nightDates[nightDates.length - 1]!;
  const availability = Math.max(0, Math.floor(params.availability));
  const free = availability;
  const auditTargetId = params.bookingId ?? params.bookingNo;
  const auditTargetType = params.auditTargetType ?? "axisrooms_inbound";

  console.info("[axisrooms.inventory] outbound start", {
    availability,
    hotelId: params.hotelId,
    roomId: params.roomId,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    startDate: params.checkIn,
    endDate,
    nights: params.nights ?? nightDates,
    nightCount: nightDates.length,
    bookingNo: params.bookingNo,
    bookingId: params.bookingId,
  });

  const bulk = await pushBulkInventoryForRange({
    hotelId: params.hotelId,
    roomId: params.roomId,
    startDate: params.checkIn,
    endDate,
    availability,
    auditTargetId,
    auditTargetType,
  });

  console.info("[axisrooms.inventory] API2 bulk result", {
    ok: bulk.ok,
    error: bulk.error,
    hotelId: params.hotelId,
    startDate: params.checkIn,
    endDate,
    availability,
    nightCount: nightDates.length,
  });

  if (!bulk.ok) {
    return {
      ok: false,
      error: bulk.error ?? "API 2 inventory push failed",
      details: {
        api2: { ok: false, message: bulk.error },
        startDate: params.checkIn,
        endDate,
        availability,
        nights: nightDates,
      },
    };
  }

  if (params.nights && params.nights.length > 0) {
    const daywiseResult = await postAxisRoomsApi("/api/daywiseInventory", {
      hotels: [
        {
          hotelId: params.hotelId,
          rooms: [
            {
              roomId: params.roomId,
              availability: params.nights.map((n) => ({
                date: n.date,
                free: n.free,
              })),
            },
          ],
        },
      ],
    });
    await auditLog({
      action: "axisrooms.inventory.daywise",
      targetType: auditTargetType,
      targetId: auditTargetId,
      metadata: {
        hotelId: params.hotelId,
        roomId: params.roomId,
        nights: params.nights,
        api: 1,
        ok: daywiseResult.ok,
        error: daywiseResult.error,
      },
    });

    console.info("[axisrooms.inventory] API1 daywise result", {
      ok: daywiseResult.ok,
      error: daywiseResult.error,
      hotelId: params.hotelId,
      nights: params.nights,
    });

    if (!daywiseResult.ok) {
      return {
        ok: false,
        error: daywiseResult.error ?? "API 1 daywise inventory push failed",
        details: {
          api2: { ok: true },
          api1: { ok: false, message: daywiseResult.error },
          startDate: params.checkIn,
          endDate,
          availability,
          nights: nightDates,
        },
      };
    }
  } else {
    const daywise = await pushInventoryForRange({
      hotelId: params.hotelId,
      roomId: params.roomId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      free,
      auditTargetId,
      auditTargetType,
    });

    console.info("[axisrooms.inventory] API1 daywise result", {
      ok: daywise.ok,
      error: daywise.error,
      hotelId: params.hotelId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      free,
    });

    if (!daywise.ok) {
      return {
        ok: false,
        error: daywise.error ?? "API 1 daywise inventory push failed",
        details: {
          api2: { ok: true },
          api1: { ok: false, message: daywise.error },
          startDate: params.checkIn,
          endDate,
          availability,
          nights: nightDates,
        },
      };
    }
  }

  return {
    ok: true,
    details: {
      api2: { ok: true },
      api1: { ok: true },
      startDate: params.checkIn,
      endDate,
      availability,
      nights: nightDates,
    },
  };
}

export async function pushInboundInventoryAck(
  params: StayInventoryPushParams,
): Promise<AxisRoomsPushResult> {
  return pushStayInventoryToAxis(params);
}

export async function pushInboundInventoryModify(params: {
  hotelId: string;
  roomId: string;
  bookingNo: string;
  bookingId?: string;
  oldCheckIn: string;
  oldCheckOut: string;
  newCheckIn: string;
  newCheckOut: string;
  oldAvailability: number;
  newAvailability: number;
  oldNights?: NightFree[];
  newNights?: NightFree[];
  auditTargetType?: string;
}): Promise<AxisRoomsPushResult> {
  if (
    params.oldCheckIn === params.newCheckIn &&
    params.oldCheckOut === params.newCheckOut
  ) {
    return { ok: true };
  }

  const openResult = await pushStayInventoryToAxis({
    hotelId: params.hotelId,
    roomId: params.roomId,
    checkIn: params.oldCheckIn,
    checkOut: params.oldCheckOut,
    bookingNo: params.bookingNo,
    bookingId: params.bookingId,
    availability: params.oldAvailability,
    nights: params.oldNights,
    auditTargetType: params.auditTargetType,
  });
  if (!openResult.ok) return openResult;

  return pushStayInventoryToAxis({
    hotelId: params.hotelId,
    roomId: params.roomId,
    checkIn: params.newCheckIn,
    checkOut: params.newCheckOut,
    bookingNo: params.bookingNo,
    bookingId: params.bookingId,
    availability: params.newAvailability,
    nights: params.newNights,
    auditTargetType: params.auditTargetType,
  });
}

export function inboundDatesFromPayload(
  checkIn: string,
  checkOut: string,
): { startDate: string; endDate: string } {
  return { startDate: checkIn, endDate: stayEndDate(checkIn, checkOut) };
}

export function hasStayNights(checkIn: string, checkOut: string): boolean {
  return expandNightDates(checkIn, checkOut).length > 0;
}

export function formatApi2Range(checkIn: string, checkOut: string): string {
  const nights = expandNightDates(checkIn, checkOut);
  if (nights.length === 0) return checkIn;
  if (nights.length === 1) return nights[0]!;
  return `${nights[0]} → ${nights[nights.length - 1]} (${nights.length} nights)`;
}

export { addDays } from "@/lib/bookingDates";
