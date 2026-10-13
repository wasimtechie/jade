import { connectDB } from "@/lib/db";
import { VillaModel } from "@/models/Villa";
import { villaAxisRoomsMapping } from "./mapBooking";
import type { AxisRoomsInboundEvent } from "./types";
import type { Types } from "mongoose";

export type InboundValidationError = {
  ok: false;
  code: string;
  error: string;
};

export type InboundValidationSuccess = {
  ok: true;
  villa: {
    _id: Types.ObjectId;
    name?: string;
    slug?: string;
  };
  mapping: {
    propertyId: string;
    roomTypeId: string;
    ratePlanId?: string;
  };
};

export type InboundValidationResult =
  | InboundValidationSuccess
  | InboundValidationError;

function isDateIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Local validation — Rates, hotelId, dates, villa mapping (runs before dedup). */
export async function validateAxisRoomsInbound(
  parsed: AxisRoomsInboundEvent,
): Promise<InboundValidationResult> {
  if (!parsed.bookingNo && !parsed.reservationId) {
    return { ok: false, code: "MISSING_BOOKING_NO", error: "Missing bookingNo" };
  }

  if (!parsed.propertyId) {
    return { ok: false, code: "MISSING_HOTEL_ID", error: "Missing hotelId" };
  }

  if (!parsed.checkIn || !parsed.checkOut) {
    return {
      ok: false,
      code: "MISSING_DATES",
      error: "Missing checkInDate or checkOutDate",
    };
  }

  if (!isDateIso(parsed.checkIn) || !isDateIso(parsed.checkOut)) {
    return {
      ok: false,
      code: "INVALID_DATES",
      error: "Dates must be yyyy-MM-dd",
    };
  }

  if (parsed.checkOut <= parsed.checkIn) {
    return {
      ok: false,
      code: "INVALID_DATE_RANGE",
      error: "checkOutDate must be after checkInDate",
    };
  }

  if (!parsed.roomTypeId) {
    return {
      ok: false,
      code: "MISSING_ROOM_TYPE",
      error: "Missing Rates.roomType[0].id",
    };
  }

  if (parsed.noOfRooms !== undefined && parsed.noOfRooms !== 1) {
    return {
      ok: false,
      code: "INVALID_ROOM_COUNT",
      error: `noOfRooms must be 1 for whole-unit villa (got ${parsed.noOfRooms})`,
    };
  }

  await connectDB();

  const mappingQuery = {
    isDeleted: false,
    "axisRooms.propertyId": parsed.propertyId,
    "axisRooms.roomTypeId": parsed.roomTypeId,
  };

  const villas = await VillaModel.find(mappingQuery).limit(2);
  if (villas.length === 0) {
    return {
      ok: false,
      code: "UNKNOWN_PROPERTY",
      error: `Unknown hotelId/roomId: ${parsed.propertyId}/${parsed.roomTypeId}`,
    };
  }
  if (villas.length > 1) {
    return {
      ok: false,
      code: "AMBIGUOUS_MAPPING",
      error: `Ambiguous villa mapping for ${parsed.propertyId}/${parsed.roomTypeId}`,
    };
  }

  const [villa] = villas;
  const mapping = villaAxisRoomsMapping(villa);

  const channelMode = villa.channelMode ?? "website_only";
  if (channelMode !== "channel_managed") {
    return {
      ok: false,
      code: "NOT_CHANNEL_MANAGED",
      error: `Property ${parsed.propertyId} is not channel-managed in Jade PMS`,
    };
  }

  const effectiveRatePlanId = parsed.ratePlanId ?? mapping.ratePlanId;
  if (!effectiveRatePlanId) {
    return {
      ok: false,
      code: "MISSING_RATE_PLAN",
      error: "Missing Rates.roomType[0].ratePlanId and no villa ratePlanId configured",
    };
  }

  if (mapping.ratePlanId && parsed.ratePlanId && mapping.ratePlanId !== parsed.ratePlanId) {
    return {
      ok: false,
      code: "INVALID_RATE_PLAN",
      error: `Invalid ratePlanId: expected ${mapping.ratePlanId}, got ${parsed.ratePlanId}`,
    };
  }

  return {
    ok: true,
    villa: {
      _id: villa._id as Types.ObjectId,
      name: villa.name,
      slug: villa.slug,
    },
    mapping: {
      propertyId: mapping.propertyId!,
      roomTypeId: mapping.roomTypeId!,
      ratePlanId: effectiveRatePlanId,
    },
  };
}
