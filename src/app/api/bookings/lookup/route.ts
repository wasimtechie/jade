import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { isMongoConfigured } from "@/lib/db";
import { getClientIpFromHeaders } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";

export const dynamic = "force-dynamic";

/** Guest booking lookup by bookingToken — no IDOR on Mongo _id. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const ip = req.ip ?? getClientIpFromHeaders(req.headers);
  const rl = await persistentRateLimit({
    key: `bookings:lookup:${ip}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  try {
    const store = getBookingStore();
    const booking = await store.findByToken(token);
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingToken: booking.bookingToken,
        villaSlug: booking.villaSlug,
        bookingType: booking.bookingType,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        status: booking.status,
        pricing: booking.pricing,
        payment: {
          status: booking.payment.status,
          amountDuePaise: booking.payment.amountDuePaise,
          depositPaise: booking.payment.depositPaise,
          balancePaise: booking.payment.balancePaise,
        },
        expiresAt: booking.expiresAt,
      },
    });
  } catch (e) {
    console.error("[GET /api/bookings/lookup]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
