import { connectDB } from "@/lib/db";
import { rangesOverlap } from "@/lib/bookingDates";
import {
  acquireNightLocks,
  releaseNightLocks,
  withTransaction,
} from "@/lib/bookings/nightLocks";
import { lockDatesForBooking } from "@/lib/bookings/pricing";
import { BookingModel } from "@/models/Booking";
import { VillaModel } from "@/models/Villa";
import { WebhookEventModel } from "@/models/WebhookEvent";
import { auditLog } from "@/lib/audit/auditLog";
import { notifyBookingConflict, notifyBookingConfirmed } from "@/lib/email/bookingNotifications";
import type { AxisRoomsInboundEvent } from "./types";
import type { InboundValidationSuccess } from "./validateInbound";
import type { AxisRoomsPushResult } from "./types";
import {
  pushInboundInventoryAck,
  pushInboundInventoryModify,
  hasStayNights,
} from "./inboundInventoryPush";
import { applyInventoryDelta, peekInventoryRange } from "./inventoryLedger";
import { villaAxisRoomsMapping } from "./mapBooking";
import type { Types } from "mongoose";

export type InboundUpsertResult = {
  ok: boolean;
  bookingId?: string;
  conflict?: boolean;
  duplicate?: boolean;
  error?: string;
  axisInventorySync?: AxisRoomsPushResult;
};

function inventoryUnitsForVilla(villa: {
  axisRooms?: { inventoryUnits?: number } | null;
}): number {
  const units = villaAxisRoomsMapping(villa).inventoryUnits ?? 1;
  return Math.max(1, Math.floor(units));
}

async function findOccupyingOverlaps(params: {
  villaId: Types.ObjectId;
  checkIn: string;
  checkOut: string;
  excludeBookingId?: Types.ObjectId;
  session?: import("mongoose").ClientSession | null;
}) {
  const now = new Date();
  const query: Record<string, unknown> = {
    villaId: params.villaId,
    isDeleted: false,
    $or: [
      { status: "confirmed" },
      { status: "on_hold" },
      { status: "conflict" },
      { status: "pending", expiresAt: { $gt: now } },
    ],
    checkIn: { $lt: params.checkOut },
    checkOut: { $gt: params.checkIn },
  };
  if (params.excludeBookingId) {
    query._id = { $ne: params.excludeBookingId };
  }
  const q = BookingModel.find(query);
  return params.session ? await q.session(params.session) : await q;
}

function sourceFromChannel(
  channel: AxisRoomsInboundEvent["channel"],
): "axisrooms_airbnb" | "axisrooms_booking_com" {
  if (channel === "airbnb") return "axisrooms_airbnb";
  return "axisrooms_booking_com";
}

function axisIdsFromInbound(
  parsed: AxisRoomsInboundEvent,
  validated?: InboundValidationSuccess,
): { hotelId: string; roomId: string } | null {
  const hotelId =
    validated?.mapping.propertyId ?? parsed.propertyId?.trim();
  const roomId = validated?.mapping.roomTypeId ?? parsed.roomTypeId?.trim();
  if (!hotelId || !roomId) return null;
  return { hotelId, roomId };
}

async function resolveInboundVillaId(
  parsed: AxisRoomsInboundEvent,
  validated?: InboundValidationSuccess,
  bookingVillaId?: unknown,
): Promise<{ villaId: string; inventoryUnits: number } | null> {
  if (bookingVillaId) {
    const villa = await VillaModel.findById(bookingVillaId).lean();
    if (villa) {
      const mapping = villaAxisRoomsMapping(villa);
      return {
        villaId: String(villa._id),
        inventoryUnits: mapping.inventoryUnits ?? 1,
      };
    }
  }
  if (validated?.villa?._id) {
    const v = await VillaModel.findById(validated.villa._id).lean();
    if (v) {
      const mapping = villaAxisRoomsMapping(v);
      return {
        villaId: String(v._id),
        inventoryUnits: mapping.inventoryUnits ?? 1,
      };
    }
  }
  const hotelId = parsed.propertyId?.trim();
  const roomId = parsed.roomTypeId?.trim();
  if (!hotelId || !roomId) return null;
  const villa = await VillaModel.findOne({
    isDeleted: false,
    "axisRooms.propertyId": hotelId,
    "axisRooms.roomTypeId": roomId,
  }).lean();
  if (!villa) return null;
  const mapping = villaAxisRoomsMapping(villa);
  return {
    villaId: String(villa._id),
    inventoryUnits: mapping.inventoryUnits ?? 1,
  };
}

async function ackInboundInventory(params: {
  parsed: AxisRoomsInboundEvent;
  validated?: InboundValidationSuccess;
  bookingNo: string;
  bookingId?: string;
  villaId?: string;
  checkIn: string;
  checkOut: string;
  /** restore = cancel (increase), reduce = confirm (decrease), repush = no delta */
  action: "reduce" | "restore" | "repush";
}): Promise<AxisRoomsPushResult | undefined> {
  if (!hasStayNights(params.checkIn, params.checkOut)) return undefined;
  const ids = axisIdsFromInbound(params.parsed, params.validated);
  if (!ids) return { ok: false, error: "Missing hotelId/roomId for API 2" };

  const villaCtx = await resolveInboundVillaId(
    params.parsed,
    params.validated,
    params.villaId,
  );
  if (!villaCtx) {
    return { ok: false, error: "Villa not found for inventory units" };
  }

  let nights;
  let availability: number;

  if (params.action === "repush") {
    nights = await peekInventoryRange({
      hotelId: ids.hotelId,
      roomId: ids.roomId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      inventoryUnits: villaCtx.inventoryUnits,
    });
    availability =
      nights.length === 0
        ? (villaCtx.inventoryUnits ?? 1)
        : Math.min(...nights.map((n) => n.free));
  } else {
    const rooms = Math.max(1, Math.floor(params.parsed.noOfRooms ?? 1));
    const delta = params.action === "reduce" ? -rooms : rooms;
    const applied = await applyInventoryDelta({
      hotelId: ids.hotelId,
      roomId: ids.roomId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      delta,
      inventoryUnits: villaCtx.inventoryUnits,
    });
    nights = applied.nights;
    availability = applied.availability;
  }

  return pushInboundInventoryAck({
    hotelId: ids.hotelId,
    roomId: ids.roomId,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    bookingNo: params.bookingNo,
    bookingId: params.bookingId,
    availability,
    nights,
  });
}

export async function upsertAxisRoomsInbound(
  parsed: AxisRoomsInboundEvent,
  validated?: InboundValidationSuccess,
): Promise<InboundUpsertResult> {
  if (!parsed.bookingNo && !parsed.reservationId) {
    return { ok: false, error: "Missing bookingNo" };
  }
  if (!parsed.propertyId || !parsed.checkIn || !parsed.checkOut) {
    return { ok: false, error: "Missing hotelId or dates" };
  }

  const bookingNo = parsed.bookingNo ?? parsed.reservationId!;
  const eventId = `${bookingNo}:${parsed.bookingStatus ?? parsed.eventType}`;

  await connectDB();

  const existingEvent = await WebhookEventModel.findOne({
    eventId,
    source: "axisrooms",
  }).lean();
  if (existingEvent?.status === "processed") {
    // Idempotent API 9 ack — still re-push inventory so Axis/CM always sees close
    const existingBooking = await BookingModel.findOne({
      axisRoomsReservationId: bookingNo,
      isDeleted: false,
    });
    if (
      existingBooking &&
      parsed.eventType !== "cancel" &&
      parsed.bookingStatus !== "cancelled" &&
      existingBooking.checkIn &&
      existingBooking.checkOut
    ) {
      const axisInventorySync = await ackInboundInventory({
        parsed,
        validated,
        bookingNo,
        bookingId: String(existingBooking._id),
        villaId: String(existingBooking.villaId),
        checkIn: existingBooking.checkIn,
        checkOut: existingBooking.checkOut,
        action: "repush",
      });
      if (axisInventorySync?.ok) {
        existingBooking.axisRoomsSynced = true;
        existingBooking.axisRoomsLastError = undefined;
        await existingBooking.save();
      } else if (axisInventorySync && !axisInventorySync.ok) {
        existingBooking.axisRoomsLastError = axisInventorySync.error;
        existingBooking.axisRoomsSyncAttempts =
          (existingBooking.axisRoomsSyncAttempts ?? 0) + 1;
        await existingBooking.save();
      }
      return {
        ok: true,
        duplicate: true,
        bookingId: String(existingBooking._id),
        axisInventorySync,
      };
    }
    return { ok: true, duplicate: true };
  }
  await WebhookEventModel.updateOne(
    { eventId, source: "axisrooms" },
    {
      $setOnInsert: {
        payload: parsed.raw,
      },
      $set: {
        bookingId: bookingNo,
        status: "received",
        error: undefined,
      },
    },
    { upsert: true },
  );

  const mappingQuery: Record<string, unknown> = {
    isDeleted: false,
    "axisRooms.propertyId": parsed.propertyId,
  };
  if (parsed.roomTypeId) {
    mappingQuery["axisRooms.roomTypeId"] = parsed.roomTypeId;
  }

  let villa;
  if (validated) {
    villa = await VillaModel.findById(validated.villa._id);
    if (!villa) {
      return { ok: false, error: "Validated villa not found" };
    }
  } else {
    const villas = await VillaModel.find(mappingQuery).limit(2);
    if (villas.length !== 1) {
      const error =
        villas.length === 0
          ? `Unknown hotelId: ${parsed.propertyId}`
          : `Ambiguous Axis mapping for property ${parsed.propertyId}`;
      await WebhookEventModel.updateOne(
        { eventId, source: "axisrooms" },
        { $set: { status: "failed", error } },
      );
      return { ok: false, error };
    }
    villa = villas[0];
  }

  if (parsed.eventType === "cancel" || parsed.bookingStatus === "cancelled") {
    const existing = await BookingModel.findOne({
      axisRoomsReservationId: bookingNo,
      isDeleted: false,
    });
    if (!existing) {
      const axisInventorySync = await ackInboundInventory({
        parsed,
        validated,
        bookingNo,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        action: "restore",
      });
      await WebhookEventModel.updateOne(
        { eventId, source: "axisrooms" },
        {
          $set: {
            status: "processed",
            error: axisInventorySync?.ok === false ? axisInventorySync.error : undefined,
          },
        },
      );
      return { ok: true, axisInventorySync };
    }
    const previousStatus = existing.status;
    existing.status = "cancelled";
    // Mark cancel synced only after outbound inventory open succeeds
    existing.axisRoomsCancelSynced = false;
    await existing.save();
    await releaseNightLocks(existing._id);
    await auditLog({
      action: "booking.cancel",
      targetType: "booking",
      targetId: String(existing._id),
      metadata: {
        source: "axisrooms_inbound",
        bookingNo,
        cancelledBy: "ota",
        previousStatus,
        channel: parsed.channel,
      },
    });
    const axisInventorySync = await ackInboundInventory({
      parsed,
      validated,
      bookingNo,
      bookingId: String(existing._id),
      villaId: String(existing.villaId),
      checkIn: existing.checkIn,
      checkOut: existing.checkOut,
      action: "restore",
    });
    if (axisInventorySync?.ok) {
      existing.axisRoomsCancelSynced = true;
      existing.axisRoomsLastError = undefined;
      await existing.save();
    } else if (axisInventorySync && !axisInventorySync.ok) {
      existing.axisRoomsLastError = axisInventorySync.error;
      existing.axisRoomsSyncAttempts =
        (existing.axisRoomsSyncAttempts ?? 0) + 1;
      await existing.save();
    }
    await WebhookEventModel.updateOne(
      { eventId, source: "axisrooms" },
      {
        $set: {
          status: "processed",
          error: axisInventorySync?.ok === false ? axisInventorySync.error : undefined,
        },
      },
    );
    return { ok: true, bookingId: String(existing._id), axisInventorySync };
  }

  const existing = await BookingModel.findOne({
    axisRoomsReservationId: bookingNo,
    isDeleted: false,
  });

  if (existing && parsed.eventType === "modify") {
    const oldCheckIn = existing.checkIn;
    const oldCheckOut = existing.checkOut;
    const lockDates = lockDatesForBooking({
      bookingType: existing.bookingType ?? "stay",
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
    });

    try {
      await withTransaction(async (session) => {
        const units = inventoryUnitsForVilla(villa);
        const overlaps = await findOccupyingOverlaps({
          villaId: villa._id as Types.ObjectId,
          checkIn: parsed.checkIn!,
          checkOut: parsed.checkOut!,
          excludeBookingId: existing._id as Types.ObjectId,
          session,
        });

        // Whole-villa (units=1): any other booking on those nights is a hard conflict.
        // Multi-unit CM (units>1): allow until capacity is full.
        if (units <= 1) {
          for (const b of overlaps) {
            if (
              rangesOverlap(
                parsed.checkIn!,
                parsed.checkOut!,
                b.checkIn,
                b.checkOut,
              )
            ) {
              throw new Error("DATE_CONFLICT");
            }
          }
        } else if (overlaps.length >= units) {
          throw new Error("DATE_CONFLICT");
        }

        await releaseNightLocks(existing._id, session);

        if (units <= 1) {
          const lock = await acquireNightLocks({
            villaId: villa._id as Types.ObjectId,
            bookingId: existing._id,
            dates: lockDates,
            session,
          });
          if (!lock.ok) throw new Error("LOCK_CONFLICT");
        }

        existing.checkIn = parsed.checkIn;
        existing.checkOut = parsed.checkOut;
        existing.status =
          existing.status === "conflict" ? "confirmed" : existing.status;
        existing.guestDetails = {
          name: parsed.guestName ?? existing.guestDetails?.name ?? "",
          email: parsed.guestEmail ?? existing.guestDetails?.email ?? "",
          phone: parsed.guestPhone ?? existing.guestDetails?.phone ?? "",
        };
        await existing.save(session ? { session } : undefined);

        await auditLog({
          action: "booking.update",
          targetType: "booking",
          targetId: String(existing._id),
          metadata: {
            source: "axisrooms_inbound",
            eventType: "modify",
            bookingNo,
            oldCheckIn,
            oldCheckOut,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            inventoryUnits: units,
            overlappingPeers: overlaps.length,
          },
        });
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Modify failed";
      await WebhookEventModel.updateOne(
        { eventId, source: "axisrooms" },
        { $set: { status: "failed", error: message } },
      );
      return { ok: false, error: message };
    }

    await WebhookEventModel.updateOne(
      { eventId, source: "axisrooms" },
      { $set: { status: "processed" } },
    );

    let axisInventorySync: AxisRoomsPushResult | undefined;
    const ids = axisIdsFromInbound(parsed, validated);
    if (ids && hasStayNights(parsed.checkIn, parsed.checkOut)) {
      const mapping = villaAxisRoomsMapping(
        (await VillaModel.findById(existing.villaId).lean()) ?? {},
      );
      const units = mapping.inventoryUnits ?? 1;
      const rooms = Math.max(1, Math.floor(parsed.noOfRooms ?? 1));
      const oldDelta = await applyInventoryDelta({
        hotelId: ids.hotelId,
        roomId: ids.roomId,
        checkIn: oldCheckIn,
        checkOut: oldCheckOut,
        delta: rooms,
        inventoryUnits: units,
      });
      const newDelta = await applyInventoryDelta({
        hotelId: ids.hotelId,
        roomId: ids.roomId,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        delta: -rooms,
        inventoryUnits: units,
      });
      axisInventorySync = await pushInboundInventoryModify({
        hotelId: ids.hotelId,
        roomId: ids.roomId,
        bookingNo,
        bookingId: String(existing._id),
        oldCheckIn,
        oldCheckOut,
        newCheckIn: parsed.checkIn,
        newCheckOut: parsed.checkOut,
        oldAvailability: oldDelta.availability,
        newAvailability: newDelta.availability,
        oldNights: oldDelta.nights,
        newNights: newDelta.nights,
      });
      if (axisInventorySync.ok) {
        existing.axisRoomsSynced = true;
        existing.axisRoomsLastError = undefined;
        await existing.save();
      } else {
        existing.axisRoomsLastError = axisInventorySync.error;
        existing.axisRoomsSyncAttempts =
          (existing.axisRoomsSyncAttempts ?? 0) + 1;
        await existing.save();
      }
    }

    return { ok: true, bookingId: String(existing._id), axisInventorySync };
  }

  if (existing) {
    // Same bookingNo, different eventId (e.g. redelivery) — re-push close
    const axisInventorySync = await ackInboundInventory({
      parsed,
      validated,
      bookingNo,
      bookingId: String(existing._id),
      villaId: String(existing.villaId),
      checkIn: existing.checkIn,
      checkOut: existing.checkOut,
      action: "reduce",
    });
    if (axisInventorySync?.ok) {
      existing.axisRoomsSynced = true;
      existing.axisRoomsLastError = undefined;
      await existing.save();
    } else if (axisInventorySync && !axisInventorySync.ok) {
      existing.axisRoomsLastError = axisInventorySync.error;
      existing.axisRoomsSyncAttempts =
        (existing.axisRoomsSyncAttempts ?? 0) + 1;
      await existing.save();
    }
    await WebhookEventModel.updateOne(
      { eventId, source: "axisrooms" },
      { $set: { status: "processed" } },
    );
    return {
      ok: true,
      bookingId: String(existing._id),
      duplicate: true,
      axisInventorySync,
    };
  }

  const lockDates = lockDatesForBooking({
    bookingType: "stay",
    checkIn: parsed.checkIn,
    checkOut: parsed.checkOut,
  });

  try {
    const result = await withTransaction(async (session) => {
      const units = inventoryUnitsForVilla(villa);
      const overlaps = await findOccupyingOverlaps({
        villaId: villa._id as Types.ObjectId,
        checkIn: parsed.checkIn!,
        checkOut: parsed.checkOut!,
        session,
      });

      const hasDirectConflict = overlaps.some(
        (b) => b.source === "website" || b.source === "admin_manual",
      );
      // Multi-unit CM: capacity full; whole-villa: any peer is handled via locks below
      const capacityFull = units > 1 && overlaps.length >= units;

      const totalPaise = parsed.totalAmountPaise ?? 0;
      const taxPaise = parsed.taxPaise ?? 0;
      const basePaise = Math.max(0, totalPaise - taxPaise);

      const bookingDoc = {
        villaId: villa._id,
        bookingType: "stay" as const,
        guestDetails: {
          name: parsed.guestName ?? "OTA Guest",
          email: parsed.guestEmail ?? "",
          phone: parsed.guestPhone ?? "",
        },
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests: parsed.totalPax ?? 1,
        adults: parsed.totalPax ?? 1,
        children: parsed.children ?? 0,
        pricing: {
          basePaise,
          extraPaxPaise: 0,
          eventPaise: 0,
          addOnPaise: 0,
          taxPaise,
          totalPaise: totalPaise || basePaise + taxPaise,
        },
        payment: {
          gateway: "external" as const,
          paymentPlan: "full" as const,
          amountDuePaise: totalPaise,
          depositPaise: 0,
          depositPaidPaise: 0,
          balancePaise: 0,
          status: "external" as const,
        },
        bookingToken: `axis_${bookingNo.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)}_${Date.now().toString(36)}`,
        status:
          hasDirectConflict || capacityFull
            ? ("conflict" as const)
            : ("confirmed" as const),
        source: sourceFromChannel(parsed.channel),
        axisRoomsReservationId: bookingNo,
        axisRoomsSynced: false,
        axisRoomsCancelSynced: true,
      };
      const created = session
        ? await BookingModel.create([bookingDoc], { session })
        : await BookingModel.create([bookingDoc]);
      const doc = created[0]!;

      // Exclusive night locks only for whole-villa (units=1)
      if (!hasDirectConflict && !capacityFull && units <= 1) {
        const lock = await acquireNightLocks({
          villaId: villa._id as Types.ObjectId,
          bookingId: doc._id,
          dates: lockDates,
          session,
        });
        if (!lock.ok) {
          doc.status = "conflict";
          await doc.save(session ? { session } : undefined);
          return { ok: true, bookingId: String(doc._id), conflict: true };
        }
      }

      await auditLog({
        action: "booking.create",
        targetType: "booking",
        targetId: String(doc._id),
        metadata: {
          source: "axisrooms_inbound",
          bookingNo,
          conflict: hasDirectConflict || capacityFull,
          inventoryUnits: units,
          overlappingPeers: overlaps.length,
        },
      });

      if (hasDirectConflict || capacityFull || doc.status === "conflict") {
        await notifyBookingConflict({
          bookingId: String(doc._id),
          villaName: villa.name ?? villa.slug ?? "Villa",
          checkIn: parsed.checkIn!,
          checkOut: parsed.checkOut!,
          guestName: parsed.guestName ?? "OTA Guest",
          source: sourceFromChannel(parsed.channel),
          reason: hasDirectConflict
            ? "Overlaps with existing direct/staff booking"
            : capacityFull
              ? "Multi-unit capacity full for these dates"
              : "Night lock could not be acquired",
        });
      } else {
        void notifyBookingConfirmed({
          bookingId: String(doc._id),
          villaName: villa.name ?? villa.slug ?? "Villa",
          checkIn: parsed.checkIn!,
          checkOut: parsed.checkOut!,
          guestName: parsed.guestName ?? "OTA Guest",
          guestEmail: parsed.guestEmail ?? "",
          guestPhone: parsed.guestPhone ?? "",
          guests: parsed.totalPax ?? 1,
          totalPaise: totalPaise || basePaise + taxPaise,
          paymentStatus: "external",
          source: sourceFromChannel(parsed.channel),
        });
      }

      return {
        ok: true,
        bookingId: String(doc._id),
        conflict: hasDirectConflict || capacityFull,
      };
    });
    await WebhookEventModel.updateOne(
      { eventId, source: "axisrooms" },
      { $set: { status: "processed", error: undefined } },
    );

    const axisInventorySync = await ackInboundInventory({
      parsed,
      validated,
      bookingNo,
      bookingId: result.bookingId,
      villaId: validated?.villa?._id
        ? String(validated.villa._id)
        : undefined,
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
      action: "reduce",
    });

    if (result.bookingId) {
      if (axisInventorySync?.ok) {
        await BookingModel.findByIdAndUpdate(result.bookingId, {
          $set: {
            axisRoomsSynced: true,
            axisRoomsLastError: undefined,
          },
        });
      } else if (axisInventorySync && !axisInventorySync.ok) {
        await BookingModel.findByIdAndUpdate(result.bookingId, {
          $set: { axisRoomsLastError: axisInventorySync.error },
          $inc: { axisRoomsSyncAttempts: 1 },
        });
      }
    }

    return { ...result, axisInventorySync };
  } catch (e) {
    await WebhookEventModel.updateOne(
      { eventId, source: "axisrooms" },
      {
        $set: {
          status: "failed",
          error: e instanceof Error ? e.message : "Inbound upsert failed",
        },
      },
    );
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Inbound upsert failed",
    };
  }
}
