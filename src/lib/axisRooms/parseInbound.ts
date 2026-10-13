import type { AxisRoomsInboundEvent } from "./types";

/** Coerce Axis JSON string|number IDs to trimmed strings (reject "NA"/empty). */
function asString(v: unknown): string | undefined {
  if (typeof v === "string") {
    const t = v.trim();
    if (!t || t === "NA") return undefined;
    return t;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return undefined;
}

function parseMoneyPaise(v: unknown): number {
  if (typeof v !== "string" && typeof v !== "number") return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function mapOtaSource(ota: string): AxisRoomsInboundEvent["channel"] {
  if (/airbnb/i.test(ota)) return "airbnb";
  if (/booking/i.test(ota)) return "booking_com";
  return "other";
}

function parseRates(p: Record<string, unknown>): {
  roomTypeId?: string;
  ratePlanId?: string;
  noOfRooms?: number;
} {
  const rates = (p.Rates ?? p.rates) as Record<string, unknown> | undefined;
  if (!rates) return {};

  const roomTypes = rates.roomType ?? rates.room_type;
  if (!Array.isArray(roomTypes) || roomTypes.length === 0) return {};

  const rt = roomTypes[0];
  if (!rt || typeof rt !== "object") return {};

  const row = rt as Record<string, unknown>;
  const noOfRoomsRaw = row.noOfRooms ?? row.no_of_rooms;
  const noOfRooms = Number(noOfRoomsRaw);

  return {
    roomTypeId: asString(row.id),
    ratePlanId: asString(row.ratePlanId) ?? asString(row.rateplanId),
    noOfRooms: Number.isFinite(noOfRooms) ? noOfRooms : undefined,
  };
}

function mapBookingStatus(
  raw: string,
): "confirmed" | "modified" | "cancelled" | "unknown" {
  const s = raw.toLowerCase();
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "modified") return "modified";
  if (s === "confirmed") return "confirmed";
  return "unknown";
}

/** Parse Axis Rooms API 9 inbound payload. */
export function parseAxisRoomsInbound(
  payload: unknown,
): AxisRoomsInboundEvent | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const p = payload as Record<string, unknown>;

  const details = (p.BookingDetails ?? p.bookingDetails) as
    | Record<string, unknown>
    | undefined;
  const checkin = (p.CheckinDetails ?? p.checkinDetails) as
    | Record<string, unknown>
    | undefined;
  const guest = (p.GuestDetails ?? p.guestDetails) as
    | Record<string, unknown>
    | undefined;

  if (!details) {
    return parseLegacyPayload(p);
  }

  const bookingNo = asString(details.bookingNo) ?? asString(details.booking_no);
  const bookingStatus = mapBookingStatus(
    asString(details.bookingStatus) ?? asString(details.booking_status) ?? "",
  );
  const hotelId = asString(details.hotelId) ?? asString(details.hotel_id);
  const otaRefId =
    asString(details.otaRefId) ?? asString(details.ota_ref_id);
  const ota = asString(details.ota) ?? "AxisRooms";
  const rates = parseRates(p);

  let eventType: AxisRoomsInboundEvent["eventType"] = "unknown";
  if (bookingStatus === "cancelled") eventType = "cancel";
  else if (bookingStatus === "modified") eventType = "modify";
  else if (bookingStatus === "confirmed") eventType = "create";

  const checkIn =
    asString(checkin?.checkInDate) ??
    asString(checkin?.checkInDateTime)?.split("T")[0] ??
    asString(checkin?.check_in);
  const checkOut =
    asString(checkin?.checkOutDate) ??
    asString(checkin?.checkOutDateTime)?.split("T")[0] ??
    asString(checkin?.check_out);

  const totalPax = Number(checkin?.totalPax ?? checkin?.total_pax ?? 1);
  const children = Number(checkin?.children ?? 0);

  return {
    eventType,
    bookingNo,
    bookingStatus,
    reservationId: bookingNo,
    propertyId: hotelId,
    roomTypeId: rates.roomTypeId,
    ratePlanId: rates.ratePlanId,
    noOfRooms: rates.noOfRooms,
    otaRefId,
    checkIn,
    checkOut,
    guestName: asString(guest?.guestName) ?? asString(guest?.guest_name),
    guestEmail: asString(guest?.emailId) ?? asString(guest?.email),
    guestPhone: asString(guest?.mobileNo) ?? asString(guest?.phone),
    channel: mapOtaSource(ota),
    totalPax: Number.isFinite(totalPax) ? totalPax : 1,
    children: Number.isFinite(children) ? children : 0,
    totalAmountPaise: parseMoneyPaise(checkin?.totalAmount ?? checkin?.total_amount),
    taxPaise: parseMoneyPaise(checkin?.taxes ?? checkin?.tax),
    accessKey: asString(p.accessKey),
    raw: p,
  };
}

function parseLegacyPayload(p: Record<string, unknown>): AxisRoomsInboundEvent | null {
  const eventRaw =
    typeof p.event === "string"
      ? p.event
      : typeof p.eventType === "string"
        ? p.eventType
        : "";

  let eventType: AxisRoomsInboundEvent["eventType"] = "unknown";
  const lower = eventRaw.toLowerCase();
  if (lower.includes("cancel")) eventType = "cancel";
  else if (lower.includes("modify") || lower.includes("update"))
    eventType = "modify";
  else if (lower.includes("create") || lower.includes("book"))
    eventType = "create";

  const channelRaw =
    typeof p.channel === "string"
      ? p.channel
      : typeof p.source === "string"
        ? p.source
        : "";

  return {
    eventType,
    reservationId:
      typeof p.reservationId === "string"
        ? p.reservationId
        : typeof p.id === "string"
          ? p.id
          : undefined,
    propertyId:
      typeof p.propertyId === "string" ? p.propertyId : undefined,
    roomTypeId:
      typeof p.roomTypeId === "string" ? p.roomTypeId : undefined,
    checkIn:
      typeof p.checkIn === "string"
        ? p.checkIn.split("T")[0]
        : undefined,
    checkOut:
      typeof p.checkOut === "string"
        ? p.checkOut.split("T")[0]
        : undefined,
    guestName: typeof p.guestName === "string" ? p.guestName : undefined,
    guestEmail: typeof p.guestEmail === "string" ? p.guestEmail : undefined,
    guestPhone: typeof p.guestPhone === "string" ? p.guestPhone : undefined,
    channel: /airbnb/i.test(channelRaw)
      ? "airbnb"
      : /booking/i.test(channelRaw)
        ? "booking_com"
        : "other",
    accessKey: typeof p.accessKey === "string" ? p.accessKey : undefined,
    raw: p,
  };
}

export function validateAxisRoomsAccessKey(payload: unknown): boolean {
  const key = process.env.AXIS_ROOMS_API_KEY?.trim();
  if (!key) return false;
  if (!payload || typeof payload !== "object") return false;
  const bodyKey = (payload as Record<string, unknown>).accessKey;
  if (typeof bodyKey !== "string") return false;
  if (bodyKey.length !== key.length) return false;
  let mismatch = 0;
  for (let i = 0; i < key.length; i++) {
    mismatch |= bodyKey.charCodeAt(i) ^ key.charCodeAt(i);
  }
  return mismatch === 0;
}
