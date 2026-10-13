import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpayWebhookVerify";
import { WebhookEventModel } from "@/models/WebhookEvent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object"
    ? (v as Record<string, unknown>)
    : null;
}

function extractWebhookFields(parsed: unknown): {
  bookingId: string | null;
  payId: string | null;
  eventId: string | null;
  orderId: string | null;
} {
  const root = asRecord(parsed);
  const payload = asRecord(root?.payload);
  const paymentWrap = asRecord(payload?.payment);
  const entity = asRecord(paymentWrap?.entity);
  const notes = asRecord(entity?.notes);
  const rawId = entity?.id;
  const payId =
    typeof rawId === "string" && rawId.startsWith("pay_") ? rawId : null;
  const orderId =
    typeof entity?.order_id === "string" && entity.order_id.startsWith("order_")
      ? entity.order_id
      : null;
  const bookingId =
    typeof notes?.booking_id === "string"
      ? notes.booking_id
      : typeof notes?.booking_uuid === "string"
        ? notes.booking_uuid
        : null;
  const eventId =
    typeof root?.id === "string"
      ? root.id
      : crypto.createHash("sha256").update(JSON.stringify(parsed)).digest("hex");

  return { bookingId, payId, eventId, orderId };
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const sig =
    req.headers.get("x-razorpay-signature") ??
    req.headers.get("X-Razorpay-Signature");

  if (
    !verifyRazorpayWebhookSignature(
      rawBody,
      typeof sig === "string" ? sig : null,
      secret,
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const root = asRecord(parsed);
  const evt = typeof root?.event === "string" ? root.event : "";

  try {
    const { bookingId, payId, eventId, orderId } = extractWebhookFields(parsed);
    await connectDB();
    if (eventId) {
      const existing = await WebhookEventModel.findOne({
        eventId,
        source: "razorpay",
      }).lean();
      if (existing?.status === "processed") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      await WebhookEventModel.updateOne(
        { eventId, source: "razorpay" },
        {
          $setOnInsert: {
            payload: parsed,
            bookingId: bookingId ?? undefined,
            paymentId: payId ?? undefined,
            orderId: orderId ?? undefined,
          },
          $set: {
            status: evt === "payment.captured" ? "received" : "ignored",
            error: undefined,
          },
        },
        { upsert: true },
      );
    }

    if (evt === "payment.captured") {
      if (bookingId && payId && eventId && orderId) {
        const store = getBookingStore();
        const result = await store.confirmPayment({
          bookingId,
          orderId,
          paymentId: payId,
          eventId,
        });
        if (!result.ok) {
          await WebhookEventModel.updateOne(
            { eventId, source: "razorpay" },
            { $set: { status: "failed", error: "Booking confirmation failed" } },
          );
          return NextResponse.json(
            { error: "Booking confirmation failed" },
            { status: 409 },
          );
        }
        await WebhookEventModel.updateOne(
          { eventId, source: "razorpay" },
          { $set: { status: "processed", error: undefined } },
        );
      } else if (eventId) {
        await WebhookEventModel.updateOne(
          { eventId, source: "razorpay" },
          { $set: { status: "failed", error: "Missing booking/order/payment ids" } },
        );
        return NextResponse.json(
          { error: "Missing Razorpay booking metadata" },
          { status: 422 },
        );
      }
    }
  } catch (e) {
    console.error("[webhooks/razorpay]", e);
    const parsedError = e instanceof Error ? e.message : "Unhandled error";
    try {
      const { eventId } = extractWebhookFields(parsed);
      if (eventId) {
        await WebhookEventModel.updateOne(
          { eventId, source: "razorpay" },
          { $set: { status: "failed", error: parsedError } },
        );
      }
    } catch {
      /* ignore secondary logging failure */
    }
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
