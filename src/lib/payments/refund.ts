/** Server-side Razorpay refund — amount computed from policy, never client-trusted. */

import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { BookingModel } from "@/models/Booking";

export async function issueRazorpayRefund(params: {
  bookingId: string;
  reason: string;
  userId?: string;
  /** If omitted, full refund of depositPaidPaise */
  refundPaise?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    return { ok: false, error: "Razorpay not configured" };
  }

  await connectDB();
  const booking = await BookingModel.findById(params.bookingId);
  if (!booking?.payment?.paymentId) {
    return { ok: false, error: "No payment to refund" };
  }

  const paid =
    booking.payment.depositPaidPaise ??
    booking.pricing?.totalPaise ??
    0;
  const refundAmount = params.refundPaise ?? paid;
  if (refundAmount <= 0 || refundAmount > paid) {
    return { ok: false, error: "Invalid refund amount" };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`, "utf8").toString("base64");
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${booking.payment.paymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: refundAmount }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, error: detail };
  }

  booking.payment.refundedPaise = (booking.payment.refundedPaise ?? 0) + refundAmount;
  booking.payment.status =
    refundAmount >= paid ? "refunded" : "partially_refunded";
  await booking.save();

  await auditLog({
    action: "refund.issue",
    targetType: "booking",
    targetId: params.bookingId,
    userId: params.userId,
    metadata: { refundPaise: refundAmount, reason: params.reason },
  });

  return { ok: true };
}
