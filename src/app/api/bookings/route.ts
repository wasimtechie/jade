import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { addDays, nowIST } from "@/lib/bookingDates";
import { BOOKING_HOLD_MINUTES } from "@/lib/bookings/config";
import { generateBookingToken } from "@/lib/bookings/ids";
import { computeBookingPricing } from "@/lib/bookings/pricing";
import { findVillaBySlug, getBookingStore } from "@/lib/bookings/mongoStore";
import { isMongoConfigured } from "@/lib/db";
import { getClientIpFromHeaders } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { requireRole } from "@/lib/auth/requireRole";
import {
  assertPlainObject,
  createBookingSchema,
} from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_JSON_BYTES = 48 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        {
          error: "Booking service unavailable",
          blocked: "MONGODB_URI not configured — see DEPLOYMENT.md",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = await persistentRateLimit({
      key: `bookings:post:${ip}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await readJsonBody(req, MAX_JSON_BYTES);
      assertPlainObject(body);
    } catch (e) {
      if (e instanceof SafeJsonError) {
        return NextResponse.json(
          { error: e.message },
          { status: e.status, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const input = parsed.data;
    const villa = await findVillaBySlug(input.villaSlug);
    if (!villa || !villa.bookable) {
      return NextResponse.json(
        { error: "Invalid or unavailable villa" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    let checkOut = input.checkOut;
    if (input.bookingType === "day_out") {
      checkOut = addDays(input.checkIn, 1);
    }
    if (checkOut <= input.checkIn && input.bookingType !== "day_out") {
      return NextResponse.json(
        { error: "checkOut must be after checkIn" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { pricing, depositPaise, errors } = computeBookingPricing({
      villa: {
        slug: villa.slug,
        basePricePaise: villa.basePricePaise,
        dayOutBasePricePaise: villa.dayOutBasePricePaise,
        stayBasePax: villa.stayBasePax,
        dayOutBasePax: villa.dayOutBasePax,
        stayMaxPax: villa.stayMaxPax,
        extraPaxStayPaise: villa.extraPaxStayPaise,
        extraPaxDayOutPaise: villa.extraPaxDayOutPaise,
        weddingVenue: villa.weddingVenue,
        weddingTiers: villa.weddingTiers,
        settings: villa.settings,
        depositPercent: villa.depositPercent,
        depositPaise: villa.depositPaise,
      },
      bookingType: input.bookingType,
      checkIn: input.checkIn,
      checkOut,
      guests: input.guests,
      adults: input.adults,
      children: input.children,
      eventTierId: input.eventTierId,
      eventGuests: input.eventGuests,
      eventStartDate: input.eventStartDate,
      eventEndDate: input.eventEndDate,
      addOns: input.addOns,
      allowedAddOnIds: villa.addOnAvailability,
    });

    if (errors.length) {
      return NextResponse.json(
        { error: errors[0].message, code: errors[0].code },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const orderAmount =
      input.paymentPlan === "deposit" ? depositPaise : pricing.totalPaise;

    const expiresAt = new Date(
      nowIST().getTime() + BOOKING_HOLD_MINUTES * 60 * 1000,
    );
    const bookingToken = generateBookingToken();
    const store = getBookingStore();

    const villaId = "_id" in villa ? String(villa._id) : villa.slug;

    const record = await store.createPending({
      villaId,
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
      eventTierId: input.eventTierId,
      eventGuests: input.eventGuests,
      eventStartDate: input.eventStartDate,
      eventEndDate: input.eventEndDate,
      paymentPlan: input.paymentPlan,
      pricing,
      payment: {
        gateway: "razorpay",
        paymentPlan: input.paymentPlan,
        amountDuePaise: pricing.totalPaise,
        depositPaise: orderAmount,
        depositPaidPaise: 0,
        balancePaise: pricing.totalPaise - orderAmount,
        status: "pending",
      },
      bookingToken,
      expiresAt,
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: record.id,
        bookingToken: record.bookingToken,
        pricing: record.pricing,
        payment: {
          amountDuePaise: record.payment.amountDuePaise,
          depositPaise: record.payment.depositPaise,
          balancePaise: record.payment.balancePaise,
          paymentPlan: record.payment.paymentPlan,
        },
        expiresAt: record.expiresAt,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    if (msg.includes("CONFLICT") || msg.includes("LOCK")) {
      return NextResponse.json(
        {
          error:
            "Selected dates are no longer available. Please choose different dates.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error("[POST /api/bookings]", err);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET(req: NextRequest) {
  // Calendar grid is readable by team (occupancy view); folio detail is not.
  const auth = await requireRole(req, "/dashboard", "read");
  if (!auth.ok) return auth.response;

  try {
    const store = getBookingStore();
    const bookings = await store.listActive();

    // Team sees occupancy + stay status only — redact guest PII and payment.
    if (auth.role === "team") {
      const assigned = new Set(auth.assignedVillas);
      const redacted = bookings.map((b) => ({
        ...b,
        guestDetails: { name: "", email: "", phone: "" },
        payment: undefined,
        isAssigned: assigned.size === 0 ? true : assigned.has(b.villaId),
      }));
      return NextResponse.json(
        { bookings: redacted },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { bookings },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
