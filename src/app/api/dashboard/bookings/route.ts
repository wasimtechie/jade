import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { addDays } from "@/lib/bookingDates";
import { generateBookingToken } from "@/lib/bookings/ids";
import { computeBookingPricing } from "@/lib/bookings/pricing";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { connectDB, isMongoConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { BookingModel } from "@/models/Booking";
import { VillaModel } from "@/models/Villa";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import {
  assertPlainObject,
  createBookingSchema,
  isoDateSchema,
} from "@/lib/security/validateInput";
import { queueBookingInventorySync } from "@/lib/axisRooms/sync";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const manualSchema = createBookingSchema.extend({
  notes: z.string().max(2000).optional(),
  externalPaymentRef: z.string().max(200).optional(),
  balanceDueDate: isoDateSchema.optional(),
});

const noStore = { "Cache-Control": "no-store" } as const;

const BOOKING_STATUSES = [
  "pending",
  "on_hold",
  "confirmed",
  "cancelled",
  "expired",
  "conflict",
] as const;

/** List bookings for the Booking Records dashboard. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/bookings", "read");
  if (!auth.ok) return auth.response;

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 200),
    500,
  );
  const status = req.nextUrl.searchParams.get("status")?.trim();
  const source = req.nextUrl.searchParams.get("source")?.trim();

  try {
    await connectDB();
    const filter: Record<string, unknown> = { isDeleted: false };
    if (status && BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
      filter.status = status;
    }
    if (source) {
      filter.source = source;
    }

    const docs = await BookingModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("villaId", "name slug")
      .select(
        "bookingToken guestDetails checkIn checkOut status source payment pricing axisRoomsReservationId createdAt updatedAt villaId",
      )
      .lean();

    const bookings = docs.map((b) => {
      const guest = (b.guestDetails ?? {}) as { name?: string; email?: string };
      const villa = b.villaId as { name?: string; slug?: string } | null;
      const pricing = (b.pricing ?? {}) as { totalPaise?: number };
      const payment = (b.payment ?? {}) as { status?: string };
      return {
        id: String(b._id),
        bookingToken: b.bookingToken,
        villaName: villa?.name ?? "—",
        villaSlug: villa?.slug ?? null,
        guestName: guest.name ?? "—",
        guestEmail: guest.email ?? null,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        source: b.source ?? "website",
        paymentStatus: payment.status ?? "pending",
        totalPaise: pricing.totalPaise ?? 0,
        axisRoomsReservationId: b.axisRoomsReservationId ?? null,
        createdAt: b.createdAt ?? null,
        updatedAt: b.updatedAt ?? null,
      };
    });

    return NextResponse.json({ bookings }, { headers: noStore });
  } catch (e) {
    console.error("[GET /api/dashboard/bookings]", e);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500, headers: noStore },
    );
  }
}

/** Staff manual booking — always on_hold, external payment, OTA inventory closed immediately. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/bookings", "write");
  if (!auth.ok) return auth.response;

  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "Booking service unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req, 48 * 1024);
    assertPlainObject(body);
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = manualSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  await connectDB();
  const villa = await VillaModel.findOne({
    slug: input.villaSlug,
    isDeleted: false,
  });
  if (!villa) {
    return NextResponse.json({ error: "Villa not found" }, { status: 404 });
  }

  if (input.guests > villa.stayMaxPax) {
    return NextResponse.json(
      {
        error: `Guest count exceeds villa maximum (${villa.stayMaxPax})`,
      },
      { status: 400 },
    );
  }

  const checkOut =
    input.bookingType === "day_out"
      ? addDays(input.checkIn, 1)
      : input.checkOut;

  try {
    const { pricing, depositPaise, errors: pricingErrors } = computeBookingPricing({
      villa: villa.toObject(),
      bookingType: input.bookingType,
      checkIn: input.checkIn,
      checkOut,
      guests: input.guests,
      adults: input.adults,
      children: input.children,
      addOns: input.addOns,
      eventTierId: input.eventTierId,
      eventGuests: input.eventGuests,
    });

    if (pricingErrors.length > 0) {
      return NextResponse.json(
        { error: pricingErrors[0].message, details: pricingErrors },
        { status: 400 },
      );
    }

    const store = getBookingStore();
    const record = await store.createManual({
      villaId: String(villa._id),
      villaSlug: villa.slug,
      bookingType: input.bookingType,
      checkIn: input.checkIn,
      checkOut,
      guests: input.guests,
      adults: input.adults ?? input.guests,
      children: input.children ?? 0,
      pets: input.pets ?? 0,
      guestDetails: {
        name: input.fullName,
        email: input.email.toLowerCase(),
        phone: input.phone,
      },
      notes: input.notes,
      addOns: input.addOns,
      paymentPlan: "full",
      pricing,
      payment: {
        gateway: "external",
        paymentPlan: "full",
        amountDuePaise: pricing.totalPaise,
        depositPaise,
        depositPaidPaise: 0,
        balancePaise: pricing.totalPaise,
        balanceDueDate: input.balanceDueDate,
        externalPaymentRef: input.externalPaymentRef,
        status: "pending",
      },
      bookingToken: generateBookingToken(),
      expiresAt: new Date(0),
      source: "admin_manual",
      status: "on_hold",
    });

    const sync = await queueBookingInventorySync(record.id, "close");

    await auditLog({
      action: "booking.create",
      targetType: "booking",
      targetId: record.id,
      userId: auth.userId,
      metadata: { manual: true, onHold: true, axisSync: sync.ok, status: "on_hold" },
    });

    const refreshed = await store.findById(record.id);
    return NextResponse.json(
      { booking: refreshed ?? record, axisSync: sync },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    if (msg.includes("CONFLICT") || msg.includes("LOCK")) {
      return NextResponse.json(
        { error: "Dates not available" },
        { status: 409 },
      );
    }
    console.error("[POST /api/dashboard/bookings]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
