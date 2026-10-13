import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { getBookingFolioDetail } from "@/lib/bookings/bookingFolio";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { isBookingRef } from "@/lib/bookings/ids";
import { issueRazorpayRefund } from "@/lib/payments/refund";
import { requireRole } from "@/lib/auth/requireRole";
import { queueBookingInventorySync, queueBookingInventoryModify } from "@/lib/axisRooms/sync";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { assertPlainObject, isoDateSchema } from "@/lib/security/validateInput";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("confirm_hold"),
    waivePayment: z.boolean().optional(),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("confirm_payment"),
    externalPaymentRef: z.string().max(200).optional(),
    paymentChannel: z
      .enum(["gpay", "phonepe", "upi", "bank_transfer", "cash", "other"])
      .optional(),
    fullAmountReceived: z.boolean().optional(),
    receivedPaise: z.number().int().min(1).optional(),
  }),
  z.object({
    action: z.literal("refund"),
    reason: z.string().max(500).optional(),
    refundPaise: z.number().int().min(1).optional(),
  }),
  z.object({
    action: z.literal("notes"),
    notes: z.string().max(2000),
  }),
  z.object({
    action: z.literal("modify_dates"),
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
  }),
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/bookings", "read");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const folio = await getBookingFolioDetail(params.id);
  if (!folio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(folio, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/bookings", "write");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req, 16 * 1024);
    assertPlainObject(body);
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const store = getBookingStore();

  try {
    if (parsed.data.action === "notes") {
      const updated = await store.updateNotes(params.id, parsed.data.notes);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await auditLog({
        action: "booking.update",
        targetType: "booking",
        targetId: params.id,
        userId: auth.userId,
        metadata: { notes: true },
      });
      return NextResponse.json({ booking: updated });
    }

    if (parsed.data.action === "confirm_hold") {
      const updated = await store.confirmHold(
        params.id,
        auth.userId,
        parsed.data.waivePayment,
      );
      if (!updated) {
        return NextResponse.json(
          { error: "Not found or not on hold" },
          { status: 404 },
        );
      }
      return NextResponse.json({ booking: updated });
    }

    if (parsed.data.action === "confirm_payment") {
      let updated;
      try {
        updated = await store.confirmExternalPayment(params.id, auth.userId, {
          externalPaymentRef: parsed.data.externalPaymentRef,
          paymentChannel: parsed.data.paymentChannel,
          fullAmountReceived: parsed.data.fullAmountReceived,
          receivedPaise: parsed.data.receivedPaise,
        });
      } catch (e) {
        if (e instanceof Error) {
          const code = e.message;
          if (
            code === "FULL_PAYMENT_REQUIRED" ||
            code === "DEPOSIT_MINIMUM_NOT_MET" ||
            code === "AMOUNT_EXCEEDS_TOTAL" ||
            code === "INVALID_AMOUNT"
          ) {
            return NextResponse.json(
              { error: "Invalid payment amount for this booking", code },
              { status: 422 },
            );
          }
        }
        throw e;
      }
      if (!updated) {
        return NextResponse.json(
          { error: "Not found or payment is not pending" },
          { status: 404 },
        );
      }
      const refreshed = await store.findById(params.id);
      return NextResponse.json({ booking: refreshed ?? updated });
    }

    if (parsed.data.action === "cancel") {
      const updated = await store.cancelBooking(params.id, auth.userId, {
        reason: parsed.data.reason,
      });
      if (!updated) {
        return NextResponse.json(
          { error: "Not found or already cancelled" },
          { status: 404 },
        );
      }
      const sync = await queueBookingInventorySync(params.id, "open");
      const refreshed = await store.findById(params.id);
      return NextResponse.json({
        booking: refreshed ?? updated,
        axisSync: sync,
      });
    }

    if (parsed.data.action === "modify_dates") {
      let result;
      try {
        result = await store.modifyBookingDates(params.id, {
          checkIn: parsed.data.checkIn,
          checkOut: parsed.data.checkOut,
          userId: auth.userId,
        });
      } catch (e) {
        if (e instanceof Error) {
          const code = e.message;
          if (code === "DATE_CONFLICT" || code === "BLOCK_CONFLICT" || code === "LOCK_CONFLICT") {
            return NextResponse.json(
              { error: "Selected dates are no longer available", code },
              { status: 409 },
            );
          }
          if (code === "INVALID_DATES") {
            return NextResponse.json(
              { error: "Check-out must be after check-in" },
              { status: 422 },
            );
          }
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        throw e;
      }

      if (!result) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const axisSync =
        result.oldCheckIn !== result.booking.checkIn ||
        result.oldCheckOut !== result.booking.checkOut
          ? await queueBookingInventoryModify(params.id, {
              checkIn: result.oldCheckIn,
              checkOut: result.oldCheckOut,
            })
          : { ok: true as const };

      const refreshed = await store.findById(params.id);
      return NextResponse.json({
        booking: refreshed ?? result.booking,
        axisSync,
        paymentWarning: result.paymentWarning,
      });
    }

    const result = await issueRazorpayRefund({
      bookingId: params.id,
      reason: parsed.data.reason ?? "staff_manual_refund",
      userId: auth.userId,
      refundPaise: parsed.data.refundPaise,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Refund failed" },
        { status: 400 },
      );
    }
    const booking = await store.findById(params.id);
    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    console.error("[PATCH /api/dashboard/bookings/[id]]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
