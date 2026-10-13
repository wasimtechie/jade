import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { isBookingRef } from "@/lib/bookings/ids";
import { isSimulatedPaymentEnabled } from "@/lib/payments/paymentGatewayMode";
import { getClientIpFromHeaders } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Simulated payment confirm — only when PAYMENT_GATEWAY_MODE=test (non-production).
 * Marks booking paid/confirmed via the same path as Razorpay webhook → dashboard + emails.
 */
export async function POST(req: NextRequest) {
  if (!isSimulatedPaymentEnabled()) {
    return NextResponse.json(
      { error: "Simulated payments are disabled" },
      { status: 403 },
    );
  }

  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = await persistentRateLimit({
      key: `payments:test:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await readJsonBody(req, 8 * 1024);
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
      typeof b.bookingToken === "string" && b.bookingToken.length >= 16
        ? b.bookingToken
        : null;

    if (!bookingId || !bookingToken) {
      return NextResponse.json(
        { error: "bookingId and bookingToken are required" },
        { status: 400 },
      );
    }

    const store = getBookingStore();
    const booking = await store.findById(bookingId);
    if (!booking || booking.bookingToken !== bookingToken) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status !== "pending") {
      return NextResponse.json({
        ok: true,
        alreadyConfirmed: booking.status === "confirmed",
        status: booking.status,
      });
    }

    const testOrderId = `test_ord_${bookingId.replace(/-/g, "").slice(0, 24)}`;
    const testPaymentId = `pay_test_${Date.now()}`;
    const testEventId = `evt_test_${bookingId}_${Date.now()}`;

    const { connectDB } = await import("@/lib/db");
    const { BookingModel } = await import("@/models/Booking");
    await connectDB();
    await BookingModel.updateOne(
      { _id: bookingId, status: "pending" },
      {
        $set: { "payment.orderId": testOrderId },
        $addToSet: { "payment.orderIds": testOrderId },
      },
    );

    const result = await store.confirmPayment({
      bookingId,
      orderId: testOrderId,
      paymentId: testPaymentId,
      eventId: testEventId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Could not confirm booking" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "test",
      bookingId,
      paymentId: testPaymentId,
      alreadyConfirmed: result.alreadyConfirmed ?? false,
    });
  } catch (err) {
    console.error("[POST /api/payments/test-confirm]", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
