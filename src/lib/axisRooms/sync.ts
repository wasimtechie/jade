import { connectDB } from "@/lib/db";
import { BookingModel } from "@/models/Booking";
import { VillaModel } from "@/models/Villa";
import { villaAxisRoomsMapping, isAxisRoomsMapped } from "./mapBooking";
import { pushInventoryForRange } from "./inventory";
import { pushDaywisePrice, pushBulkPriceForRange } from "./pricing";
import { pushBulkInventoryForRange } from "./inventory";
import { pushCmRestrictions } from "./restrictions";
import {
  hasStayNights,
  pushInboundInventoryModify,
  pushStayInventoryToAxis,
} from "./inboundInventoryPush";
import { applyInventoryDelta } from "./inventoryLedger";
import type { AxisRoomsPushResult } from "./types";
import { addDays, todayIST } from "@/lib/bookingDates";

type BookingDoc = {
  _id: unknown;
  villaId: unknown;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  axisRoomsSynced?: boolean;
  axisRoomsReservationId?: string;
  source?: string;
};

async function loadVillaForBooking(booking: BookingDoc) {
  await connectDB();
  const villa = await VillaModel.findById(booking.villaId).lean();
  if (!villa || !isAxisRoomsMapped(villa)) return null;
  return { villa, mapping: villaAxisRoomsMapping(villa) };
}

/**
 * Close inventory on OTAs after a validated booking save.
 * Always hits API 2 (bulk) then API 1 (daywise) — website/staff/direct.
 * OTA (API 9) path pushes itself in upsert; skip here only when already synced.
 */
export async function syncBookingInventoryClose(
  booking: BookingDoc,
): Promise<AxisRoomsPushResult> {
  if (
    booking.source?.startsWith("axisrooms_") &&
    booking.axisRoomsSynced
  ) {
    return { ok: true };
  }
  if (!booking.checkIn || !booking.checkOut) {
    return { ok: false, error: "Missing dates" };
  }
  if (!hasStayNights(booking.checkIn, booking.checkOut)) {
    return { ok: true };
  }

  const ctx = await loadVillaForBooking(booking);
  if (!ctx?.mapping.propertyId || !ctx.mapping.roomTypeId) {
    return { ok: false, error: "Villa not mapped to Axis Rooms" };
  }

  const units = ctx.mapping.inventoryUnits ?? 1;
  const applied = await applyInventoryDelta({
    hotelId: ctx.mapping.propertyId,
    roomId: ctx.mapping.roomTypeId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    delta: -1,
    inventoryUnits: units,
  });

  return pushStayInventoryToAxis({
    hotelId: ctx.mapping.propertyId,
    roomId: ctx.mapping.roomTypeId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    bookingNo: booking.axisRoomsReservationId ?? String(booking._id),
    bookingId: String(booking._id),
    availability: applied.availability,
    nights: applied.nights,
    auditTargetType: "booking",
  });
}

/** Open inventory on OTAs — cancel / release hold (restore units). */
export async function syncBookingInventoryOpen(
  booking: BookingDoc,
): Promise<AxisRoomsPushResult> {
  if (!booking.checkIn || !booking.checkOut) {
    return { ok: false, error: "Missing dates" };
  }
  if (!hasStayNights(booking.checkIn, booking.checkOut)) {
    return { ok: true };
  }

  const ctx = await loadVillaForBooking(booking);
  if (!ctx?.mapping.propertyId || !ctx.mapping.roomTypeId) {
    return { ok: false, error: "Villa not mapped to Axis Rooms" };
  }

  const units = ctx.mapping.inventoryUnits ?? 1;
  const applied = await applyInventoryDelta({
    hotelId: ctx.mapping.propertyId,
    roomId: ctx.mapping.roomTypeId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    delta: 1,
    inventoryUnits: units,
  });

  return pushStayInventoryToAxis({
    hotelId: ctx.mapping.propertyId,
    roomId: ctx.mapping.roomTypeId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    bookingNo: booking.axisRoomsReservationId ?? String(booking._id),
    bookingId: String(booking._id),
    availability: applied.availability,
    nights: applied.nights,
    auditTargetType: "booking",
  });
}

export async function syncBlockInventory(
  block: {
    _id: unknown;
    villaId: unknown;
    checkIn: string;
    checkOut: string;
  },
  free: number,
): Promise<AxisRoomsPushResult> {
  await connectDB();
  const villa = await VillaModel.findById(block.villaId).lean();
  if (!villa || !isAxisRoomsMapped(villa)) {
    return { ok: false, error: "Villa not mapped" };
  }
  const mapping = villaAxisRoomsMapping(villa);
  return pushInventoryForRange({
    hotelId: mapping.propertyId!,
    roomId: mapping.roomTypeId!,
    checkIn: block.checkIn,
    checkOut: block.checkOut,
    free,
    auditTargetId: String(block._id),
    auditTargetType: "villa_block",
  });
}

export async function syncVillaChannelState(villa: {
  _id: unknown;
  slug?: string;
  status?: string;
  bookable?: boolean;
  basePricePaise?: number;
  axisRooms?: { propertyId?: string; roomTypeId?: string; ratePlanId?: string };
}): Promise<{ price?: AxisRoomsPushResult; restrictions?: AxisRoomsPushResult }> {
  if (!isAxisRoomsMapped(villa)) return {};

  const mapping = villaAxisRoomsMapping(villa);
  const start = todayIST();
  const end = addDays(start, 90);
  const dates: string[] = [];
  let cur = start;
  while (cur <= end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }

  const results: {
    price?: AxisRoomsPushResult;
    restrictions?: AxisRoomsPushResult;
  } = {};

  const hidden = villa.status === "hidden";
  const notBookable = villa.bookable === false;

  if (villa.basePricePaise && villa.basePricePaise > 0 && mapping.ratePlanId) {
    const doublePriceRupees = Math.round(villa.basePricePaise / 100);
    results.price = await pushBulkPriceForRange({
      hotelId: mapping.propertyId!,
      roomId: mapping.roomTypeId!,
      ratePlanId: mapping.ratePlanId,
      startDate: start,
      endDate: end,
      doublePriceRupees,
      auditTargetId: String(villa._id),
    });
    if (!results.price.ok) {
      results.price = await pushDaywisePrice({
        hotelId: mapping.propertyId!,
        roomId: mapping.roomTypeId!,
        ratePlanId: mapping.ratePlanId,
        doublePriceRupees,
        dates,
        auditTargetId: String(villa._id),
      });
    }
  }

  if (!hidden && !notBookable) {
    await pushBulkInventoryForRange({
      hotelId: mapping.propertyId!,
      roomId: mapping.roomTypeId!,
      startDate: start,
      endDate: end,
      availability: 1,
      auditTargetId: String(villa._id),
      auditTargetType: "villa",
    });
  }

  if ((hidden || notBookable) && mapping.ratePlanId) {
    results.restrictions = await pushCmRestrictions({
      hotelId: mapping.propertyId!,
      roomId: mapping.roomTypeId!,
      ratePlanId: mapping.ratePlanId,
      reStatus: "close",
      auditTargetId: String(villa._id),
    });
  } else if (mapping.ratePlanId) {
    results.restrictions = await pushCmRestrictions({
      hotelId: mapping.propertyId!,
      roomId: mapping.roomTypeId!,
      ratePlanId: mapping.ratePlanId,
      reStatus: "open",
      auditTargetId: String(villa._id),
    });
  }

  return results;
}

export async function markBookingSyncResult(
  bookingId: string,
  result: AxisRoomsPushResult,
  mode: "close" | "open",
): Promise<void> {
  await connectDB();
  const doc = await BookingModel.findById(bookingId);
  if (!doc) return;

  if (result.ok) {
    if (mode === "close") {
      doc.axisRoomsSynced = true;
      doc.axisRoomsLastError = undefined;
    } else {
      doc.axisRoomsCancelSynced = true;
      doc.axisRoomsLastError = undefined;
    }
  } else {
    doc.axisRoomsLastError = result.error;
    doc.axisRoomsSyncAttempts = (doc.axisRoomsSyncAttempts ?? 0) + 1;
  }
  await doc.save();
}

export async function queueBookingInventorySync(
  bookingId: string,
  mode: "close" | "open",
): Promise<AxisRoomsPushResult> {
  await connectDB();
  const doc = await BookingModel.findById(bookingId);
  if (!doc) return { ok: false, error: "Booking not found" };

  const result =
    mode === "close"
      ? await syncBookingInventoryClose(doc)
      : await syncBookingInventoryOpen(doc);

  await markBookingSyncResult(bookingId, result, mode);
  return result;
}

function shouldPushAxisOnModify(booking: BookingDoc): boolean {
  if (booking.source?.startsWith("axisrooms_")) return false;
  if (booking.status === "on_hold" || booking.status === "confirmed") return true;
  return Boolean(booking.axisRoomsSynced);
}

/** Reschedule inventory: open old date range, then close new range (API 1). */
export async function syncBookingInventoryModify(
  booking: BookingDoc,
  oldCheckIn: string,
  oldCheckOut: string,
): Promise<AxisRoomsPushResult> {
  if (booking.source?.startsWith("axisrooms_")) {
    return { ok: true };
  }
  if (!booking.checkIn || !booking.checkOut) {
    return { ok: false, error: "Missing dates" };
  }
  if (oldCheckIn === booking.checkIn && oldCheckOut === booking.checkOut) {
    return { ok: true };
  }

  const ctx = await loadVillaForBooking(booking);
  if (!ctx) return { ok: false, error: "Villa not mapped to Axis Rooms" };

  const push = shouldPushAxisOnModify(booking);
  if (!push) return { ok: true };

  const auditTargetId = String(booking._id);
  const { propertyId, roomTypeId } = ctx.mapping;
  if (!propertyId || !roomTypeId) {
    return { ok: false, error: "Incomplete Axis mapping" };
  }

  const units = ctx.mapping.inventoryUnits ?? 1;
  const oldDelta = await applyInventoryDelta({
    hotelId: propertyId,
    roomId: roomTypeId,
    checkIn: oldCheckIn,
    checkOut: oldCheckOut,
    delta: 1,
    inventoryUnits: units,
  });
  const newDelta = await applyInventoryDelta({
    hotelId: propertyId,
    roomId: roomTypeId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    delta: -1,
    inventoryUnits: units,
  });

  return pushInboundInventoryModify({
    hotelId: propertyId,
    roomId: roomTypeId,
    bookingNo: booking.axisRoomsReservationId ?? auditTargetId,
    bookingId: auditTargetId,
    oldCheckIn,
    oldCheckOut,
    newCheckIn: booking.checkIn,
    newCheckOut: booking.checkOut,
    oldAvailability: oldDelta.availability,
    newAvailability: newDelta.availability,
    oldNights: oldDelta.nights,
    newNights: newDelta.nights,
    auditTargetType: "booking",
  });
}

export async function queueBookingInventoryModify(
  bookingId: string,
  oldDates: { checkIn: string; checkOut: string },
): Promise<AxisRoomsPushResult> {
  await connectDB();
  const doc = await BookingModel.findById(bookingId);
  if (!doc) return { ok: false, error: "Booking not found" };

  const result = await syncBookingInventoryModify(
    doc,
    oldDates.checkIn,
    oldDates.checkOut,
  );
  await markBookingSyncResult(bookingId, result, "close");
  return result;
}
