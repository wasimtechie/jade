import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { verifyRazorpayCheckoutSignature } from "@/lib/payments/razorpayCheckoutVerify";
import { getClientIpFromHeaders } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = await persistentRateLimit({
      key: `payments:rzp:verify:${ip}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
      typeof b.bookingId === "string" ? b.bookingId.trim() : "";
    const bookingToken =
      typeof b.bookingToken === "string" ? b.bookingToken.trim() : "";
    const orderId =
      typeof b.razorpay_order_id === "string" ? b.razorpay_order_id.trim() : "";
    const paymentId =
      typeof b.razorpay_payment_id === "string"
        ? b.razorpay_payment_id.trim()
        : "";
    const signature =
      typeof b.razorpay_signature === "string"
        ? b.razorpay_signature.trim()
        : null;

    if (!bookingId || !bookingToken || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing booking or Razorpay verification fields" },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        { error: "Payments are not configured" },
        { status: 503 },
      );
    }

    if (
      !verifyRazorpayCheckoutSignature({
        orderId,
        paymentId,
        signature,
        secret,
      })
    ) {
      return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 401 });
    }

    const store = getBookingStore();
    const booking = await store.findById(bookingId);
    if (!booking || booking.bookingToken !== bookingToken) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const result = await store.confirmPayment({
      bookingId,
      orderId,
      paymentId,
      eventId: `verify:${paymentId}`,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Could not confirm booking" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      alreadyConfirmed: result.alreadyConfirmed ?? false,
    });
  } catch (err) {
    console.error("[POST /api/payments/razorpay-verify]", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
