import { NextRequest, NextResponse } from "next/server";
import { addDays } from "@/lib/bookingDates";
import { getBookingStore, findVillaBySlug } from "@/lib/bookings/mongoStore";
import { computeBookingPricing, lockDatesForBooking } from "@/lib/bookings/pricing";
import { isMongoConfigured } from "@/lib/db";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import {
  assertPlainObject,
  createBookingSchema,
} from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";

/** Server-only pricing preview — no booking created, no client-trusted amounts. */
export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Pricing unavailable", blocked: "MONGODB_URI not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await readJsonBody(req, 32 * 1024);
    assertPlainObject(body);
    const parsed = createBookingSchema
      .omit({ fullName: true, phone: true, email: true, notes: true })
      .extend({
        fullName: createBookingSchema.shape.fullName.optional(),
        phone: createBookingSchema.shape.phone.optional(),
        email: createBookingSchema.shape.email.optional(),
      })
      .safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const villa = await findVillaBySlug(input.villaSlug);
    if (!villa || !villa.bookable) {
      return NextResponse.json({ error: "Invalid villa" }, { status: 400 });
    }

    let checkOut = input.checkOut;
    if (input.bookingType === "day_out") {
      checkOut = addDays(input.checkIn, 1);
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
        { status: 400 },
      );
    }

    const villaId = "_id" in villa ? String(villa._id) : villa.slug;
    const store = getBookingStore();
    const lockDates = lockDatesForBooking({
      bookingType: input.bookingType,
      checkIn: input.checkIn,
      checkOut,
      eventStartDate: input.eventStartDate,
      eventEndDate: input.eventEndDate,
    });
    const { bookedDates, blockedDates } = await store.getAvailability(
      villaId,
      input.checkIn,
      checkOut,
    );
    const blocked = new Set([...bookedDates, ...blockedDates]);
    const conflictingDate = lockDates.find((date) => blocked.has(date));
    if (conflictingDate) {
      return NextResponse.json(
        {
          error:
            "Selected dates are no longer available. Please choose different dates.",
          conflictingDate,
        },
        { status: 409 },
      );
    }

    const orderAmount =
      input.paymentPlan === "deposit" ? depositPaise : pricing.totalPaise;

    return NextResponse.json({
      pricing,
      payment: {
        amountDuePaise: pricing.totalPaise,
        depositPaise: orderAmount,
        balancePaise: pricing.totalPaise - orderAmount,
        paymentPlan: input.paymentPlan,
      },
    });
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[POST /api/bookings/preview]", e);
    return NextResponse.json({ error: "Preview failed" }, { status: 500 });
  }
}
