import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { VillaModel } from "@/models/Villa";
import { isAxisRoomsMapped, villaAxisRoomsMapping } from "./mapBooking";
import { parseAxisRoomsInbound } from "./parseInbound";
import { postAxisRoomsApi } from "./http";
import { upsertAxisRoomsInbound } from "./upsertInboundBooking";
import { validateAxisRoomsInbound } from "./validateInbound";
import type { AxisRoomsInboundEvent } from "./types";

const MS_PER_DAY = 86_400_000;

/** Convert dd/MM/yyyy or dd/MM/yyyy HH:mm:ss to yyyy-MM-dd. */
export function normalizePullDate(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim() || raw === "NA") return undefined;
  const s = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return undefined;
}

/** Format Date as dd/MM/yyyy for pull request. */
export function formatPullRequestDate(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Normalize API 12 pull row into API 9-like shape for parseAxisRoomsInbound. */
export function normalizePullBookingRow(
  row: Record<string, unknown>,
): Record<string, unknown> | null {
  const details = (row.BookingDetails ?? row.bookingDetails ?? row) as Record<
    string,
    unknown
  >;
  const checkin = (row.CheckinDetails ?? row.checkinDetails ?? row) as Record<
    string,
    unknown
  >;
  const guest = (row.GuestDetails ?? row.guestDetails ?? row) as Record<
    string,
    unknown
  >;

  const bookingNo =
    details.bookingNo ?? details.booking_no ?? row.bookingNo ?? row.booking_no;
  const hotelId = details.hotelId ?? details.hotel_id ?? row.hotelId;
  const checkIn =
    normalizePullDate(checkin.checkInDate) ??
    normalizePullDate(checkin.checkInDateTime) ??
    normalizePullDate(checkin.check_in) ??
    normalizePullDate(row.checkIn);
  const checkOut =
    normalizePullDate(checkin.checkOutDate) ??
    normalizePullDate(checkin.checkOutDateTime) ??
    normalizePullDate(checkin.check_out) ??
    normalizePullDate(row.checkOut);

  if (!bookingNo || !hotelId || !checkIn || !checkOut) return null;

  return {
    BookingDetails: {
      bookingNo,
      bookingStatus:
        details.bookingStatus ??
        details.booking_status ??
        row.bookingStatus ??
        "confirmed",
      hotelId,
      ota: details.ota ?? row.ota ?? "AxisRooms",
    },
    CheckinDetails: {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPax: checkin.totalPax ?? checkin.total_pax ?? row.totalPax ?? 1,
      children: checkin.children ?? row.children ?? 0,
      totalAmount:
        checkin.totalAmount ??
        checkin.amount ??
        checkin.total_amount ??
        row.amount ??
        "0",
      taxes: checkin.taxes ?? checkin.tax ?? row.taxes ?? "0",
    },
    GuestDetails: {
      guestName: guest.guestName ?? guest.guest_name ?? row.guestName,
      emailId: guest.emailId ?? guest.email ?? row.guestEmail,
      mobileNo: guest.mobileNo ?? guest.phone ?? row.guestPhone,
    },
  };
}

export function parsePullBookingPayload(
  payload: unknown,
): AxisRoomsInboundEvent[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const list =
    (Array.isArray(p.bookings) && p.bookings) ||
    (Array.isArray(p.Bookings) && p.Bookings) ||
    (Array.isArray(p.data) && p.data) ||
    [];

  const events: AxisRoomsInboundEvent[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const normalized = normalizePullBookingRow(item as Record<string, unknown>);
    if (!normalized) continue;
    const parsed = parseAxisRoomsInbound(normalized);
    if (parsed) events.push(parsed);
  }
  return events;
}

/** Fill missing Rates fields from villa mapping (API 12 pull rows). */
export async function enrichInboundFromVillaMapping(
  event: AxisRoomsInboundEvent,
): Promise<AxisRoomsInboundEvent> {
  if (event.roomTypeId && event.ratePlanId) return event;
  if (!event.propertyId) return event;

  await connectDB();
  const villa = await VillaModel.findOne({
    isDeleted: false,
    "axisRooms.propertyId": event.propertyId,
  }).lean();
  if (!villa) return event;

  const mapping = villaAxisRoomsMapping(villa);
  return {
    ...event,
    roomTypeId: event.roomTypeId ?? mapping.roomTypeId,
    ratePlanId: event.ratePlanId ?? mapping.ratePlanId,
    noOfRooms: event.noOfRooms ?? 1,
  };
}

/** API 12 — pull bookings for one hotel in a max-10-day window. */
export async function pullBookingsForHotel(params: {
  hotelId: string;
  startDate: Date;
  endDate: Date;
}): Promise<{
  ok: boolean;
  events: AxisRoomsInboundEvent[];
  error?: string;
}> {
  const result = await postAxisRoomsApi("/api/pullBooking", {
    hotelId: params.hotelId,
    startDate: formatPullRequestDate(params.startDate),
    endDate: formatPullRequestDate(params.endDate),
  });

  if (!result.ok) {
    return { ok: false, events: [], error: result.error };
  }

  return { ok: true, events: parsePullBookingPayload(result.data) };
}

export type PullReconcileSummary = {
  hotels: number;
  windows: number;
  pulled: number;
  upserted: number;
  duplicates: number;
  conflicts: number;
  errors: string[];
};

/** Nightly safety-net: pull last 10 days for every channel-managed mapped villa. */
export async function reconcileAxisRoomsPull(): Promise<PullReconcileSummary> {
  await connectDB();

  const villas = await VillaModel.find({ isDeleted: false }).lean();
  const mapped = villas.filter((v) => isAxisRoomsMapped(v));

  const end = new Date();
  const start = new Date(end.getTime() - 9 * MS_PER_DAY);

  const summary: PullReconcileSummary = {
    hotels: mapped.length,
    windows: 0,
    pulled: 0,
    upserted: 0,
    duplicates: 0,
    conflicts: 0,
    errors: [],
  };

  for (const villa of mapped) {
    const hotelId = villa.axisRooms?.propertyId?.trim();
    if (!hotelId) continue;

    summary.windows += 1;
    const pull = await pullBookingsForHotel({ hotelId, startDate: start, endDate: end });
    if (!pull.ok) {
      summary.errors.push(`${hotelId}: ${pull.error ?? "pull failed"}`);
      continue;
    }

    summary.pulled += pull.events.length;

    for (const event of pull.events) {
      try {
        const enriched = await enrichInboundFromVillaMapping(event);
        const validation = await validateAxisRoomsInbound(enriched);
        if (!validation.ok) {
          summary.errors.push(validation.error);
          continue;
        }
        const result = await upsertAxisRoomsInbound(enriched, validation);
        if (result.duplicate) summary.duplicates += 1;
        else if (result.conflict) summary.conflicts += 1;
        else if (result.ok) summary.upserted += 1;
        else if (result.error) summary.errors.push(result.error);
      } catch (e) {
        summary.errors.push(
          e instanceof Error ? e.message : "upsert failed",
        );
      }
    }
  }

  await auditLog({
    action: "axisrooms.pull.reconcile",
    targetType: "system",
    metadata: summary,
  });

  return summary;
}
