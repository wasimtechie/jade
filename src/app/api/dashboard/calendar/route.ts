import { NextRequest, NextResponse } from "next/server";
import {
  addDays,
  expandDateRangeInclusive,
  todayIST,
} from "@/lib/bookingDates";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import type { BookingRecord } from "@/lib/bookings/store";
import {
  computeCalendarStats,
  computeDayOccupancy,
} from "@/lib/calendar/stats";
import type { CalendarMeta, CalendarVilla } from "@/lib/calendar/types";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { canAccess, roleCanWrite } from "@/lib/auth/permissions";
import { VillaModel } from "@/models/Villa";
import { VillaBlockModel } from "@/models/VillaBlock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_WINDOW_DAYS = 31;

function parseDate(param: string | null, fallback: string): string {
  if (param && ISO_DATE.test(param)) return param;
  return fallback;
}

function rangesOverlap(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string,
): boolean {
  return aIn < bOut && bIn < aOut;
}

function redactBookingForTeam(b: BookingRecord): BookingRecord {
  return {
    ...b,
    guestDetails: { name: "", email: "", phone: "" },
    payment: {
      ...b.payment,
      orderId: undefined,
      paymentId: undefined,
      processedPaymentId: undefined,
    },
  };
}

function buildMeta(
  role: CalendarMeta["role"],
): CalendarMeta {
  const bookingLevel = canAccess("/dashboard/bookings", role);
  return {
    role,
    canViewGuestDetails: role !== "team",
    canOpenFolio: bookingLevel === "read" || bookingLevel === "write",
    canCreateBlocks: roleCanWrite("/dashboard/blocks", role),
  };
}

/**
 * Calendar data for the dashboard grid — villas, bookings, blocks, stats,
 * and per-day occupancy for the requested date window.
 */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard", "read");
  if (!auth.ok) return auth.response;

  const { searchParams } = req.nextUrl;
  const from = parseDate(searchParams.get("from"), todayIST());
  const to = parseDate(searchParams.get("to"), addDays(from, 13));

  if (from >= to) {
    return NextResponse.json(
      { error: "Invalid date range" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const days = expandDateRangeInclusive(from, to);
  if (days.length > MAX_WINDOW_DAYS) {
    return NextResponse.json(
      { error: `Date window cannot exceed ${MAX_WINDOW_DAYS} days` },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    await connectDB();

    const villaDocs = await VillaModel.find({ isDeleted: false })
      .sort({ bookable: -1, name: 1 })
      .lean();

    let villas: CalendarVilla[] = villaDocs.map((v) => ({
      id: String(v._id),
      slug: v.slug,
      name: (v as { shortName?: string }).shortName ?? v.name,
      status: v.status ?? "active",
      bookable: (v as { bookable?: boolean }).bookable ?? true,
      weddingVenue: (v as { weddingVenue?: boolean }).weddingVenue ?? false,
      location: (v as { location?: string }).location ?? null,
      stayMaxPax: (v as { stayMaxPax?: number }).stayMaxPax ?? undefined,
    }));

    if (auth.role === "team" && auth.assignedVillas.length > 0) {
      const assigned = new Set(auth.assignedVillas);
      villas = villas.filter((v) => assigned.has(v.id));
    }

    const slugById = new Map(villas.map((v) => [v.id, v.slug]));

    const store = getBookingStore();
    const allBookings = await store.listActive();
    let bookings: BookingRecord[] = allBookings
      .filter((b) => rangesOverlap(b.checkIn, b.checkOut, from, to))
      .map((b) => ({
        ...b,
        villaSlug: b.villaSlug ?? slugById.get(b.villaId),
      }));

    if (auth.role === "team" && auth.assignedVillas.length > 0) {
      const assigned = new Set(auth.assignedVillas);
      bookings = bookings.filter((b) => assigned.has(b.villaId));
    }

    if (auth.role === "team") {
      bookings = bookings.map(redactBookingForTeam);
    }

    const villaIds = villas.map((v) => v.id);

    bookings = bookings.filter((b) => villaIds.includes(b.villaId));

    const blockDocs = await VillaBlockModel.find({
      isDeleted: false,
      villaId: { $in: villaIds },
      checkIn: { $lt: to },
      checkOut: { $gt: from },
    })
      .sort({ checkIn: 1 })
      .lean();

    const blocks = blockDocs.map((b) => ({
      id: String(b._id),
      villaId: String(b.villaId),
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      reason: b.reason ?? "",
    }));

    const stats = computeCalendarStats(villas, bookings, blocks, days);
    const occupancy = computeDayOccupancy(villas, bookings, blocks, days);
    const meta = buildMeta(auth.role);

    return NextResponse.json(
      { from, to, villas, bookings, blocks, stats, occupancy, meta },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/calendar]", e);
    return NextResponse.json(
      { error: "Failed to load calendar" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
