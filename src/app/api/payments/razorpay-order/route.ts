import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { isBookingRef } from "@/lib/bookings/ids";
import { getPaymentGatewayMode } from "@/lib/payments/paymentGatewayMode";
import { getClientIpFromHeaders } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Creates Razorpay order — amount re-derived server-side from booking.pricing (client amount ignored). */
export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = await persistentRateLimit({
      key: `payments:rzp:${ip}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (getPaymentGatewayMode() === "test") {
      return NextResponse.json(
        {
          configured: false,
          error:
            "Simulated test mode — use Pay (TEST) on the booking screen or set PAYMENT_GATEWAY_MODE=razorpay_test",
        },
        { status: 501 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { configured: false, error: "Payments are not configured" },
        { status: 501 },
      );
    }

    let body: unknown;
    try {
      body = await readJsonBody(req, 12 * 1024);
      assertPlainObject(body);
    } catch (e) {
      if (e instanceof SafeJsonError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const bookingId =
      typeof b.bookingId === "string" && isBookingRef(b.bookingId)
        ? b.bookingId
        : null;
    const bookingToken =
      typeof b.bookingToken === "string" ? b.bookingToken : null;

    const store = getBookingStore();
    const booking = bookingId
      ? await store.findById(bookingId)
      : bookingToken
        ? await store.findByToken(bookingToken)
        : null;

    if (!booking || booking.status !== "pending") {
      return NextResponse.json({ error: "Booking not found or expired" }, { status: 404 });
    }

    // Server-derived amount — ignore client amountSubunits
    const amountSubunits =
      booking.payment.paymentPlan === "deposit"
        ? booking.payment.depositPaise
        : booking.pricing.totalPaise;

    if (!Number.isInteger(amountSubunits) || amountSubunits < 100) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`, "utf8").toString("base64");
    const receipt = `bk${booking.id.slice(-8)}${Date.now()}`.slice(0, 40);

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountSubunits,
        currency: "INR",
        receipt,
        payment_capture: 1,
        notes: { booking_id: booking.id, booking_token: booking.bookingToken },
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: "Razorpay order failed", detail: payload },
        { status: 502 },
      );
    }

    const orderId = (payload as { id?: string }).id;
    if (orderId) {
      const { connectDB } = await import("@/lib/db");
      const { BookingModel } = await import("@/models/Booking");
      await connectDB();
      await BookingModel.updateOne(
        { _id: booking.id },
        {
          $set: { "payment.orderId": orderId },
          $addToSet: { "payment.orderIds": orderId },
        },
      );
    }

    return NextResponse.json({
      configured: true,
      orderId,
      amount: amountSubunits,
      currency: "INR",
      keyId,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error("[POST /api/payments/razorpay-order]", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
