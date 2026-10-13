import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { issueRazorpayRefund } from "@/lib/payments/refund";
import { BookingModel } from "@/models/Booking";
import { assertPlainObject } from "@/lib/security/validateInput";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

const resolveSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(["refund", "confirm_manual", "cancel"]),
  reason: z.string().max(500).optional(),
});

type PopulatedVilla = { name?: string; slug?: string } | null;

function serializeConflict(doc: {
  _id: unknown;
  bookingToken: string;
  villaId?: PopulatedVilla | { name?: string; slug?: string };
  guestDetails?: { name?: string; email?: string };
  checkIn: string;
  checkOut: string;
  source?: string;
  pricing?: { totalPaise?: number };
  payment?: { status?: string; paymentId?: string };
  staahReservationId?: string;
  staahLastError?: string;
  axisRoomsReservationId?: string;
  axisRoomsLastError?: string;
  notes?: string;
  updatedAt?: Date;
}) {
  const villa =
    doc.villaId && typeof doc.villaId === "object" && "name" in doc.villaId
      ? doc.villaId
      : null;

  return {
    id: String(doc._id),
    bookingToken: doc.bookingToken,
    villaName: villa?.name ?? "Unknown villa",
    villaSlug: villa?.slug ?? null,
    guestName: doc.guestDetails?.name ?? "Guest",
    guestEmail: doc.guestDetails?.email ?? null,
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    source: doc.source ?? "website",
    totalPaise: doc.pricing?.totalPaise ?? 0,
    paymentStatus: doc.payment?.status ?? "pending",
    paymentId: doc.payment?.paymentId ?? null,
    axisRoomsReservationId:
      doc.axisRoomsReservationId ?? doc.staahReservationId ?? null,
    axisRoomsLastError: doc.axisRoomsLastError ?? doc.staahLastError ?? null,
    notes: doc.notes ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/conflicts", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const docs = await BookingModel.find({
      status: "conflict",
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate("villaId", "name slug")
      .lean();

    return NextResponse.json(
      { conflicts: docs.map((d) => serializeConflict(d as never)) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/conflicts]", e);
    return NextResponse.json(
      { error: "Failed to load conflicts" },
      { status: 500, headers: noStore },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/conflicts", "write");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
    assertPlainObject(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: noStore },
    );
  }

  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const { bookingId, action, reason } = parsed.data;

  try {
    await connectDB();
    const booking = await BookingModel.findById(bookingId);
    if (!booking || booking.status !== "conflict") {
      return NextResponse.json(
        { error: "Conflict not found" },
        { status: 404, headers: noStore },
      );
    }

    if (action === "refund") {
      const result = await issueRazorpayRefund({
        bookingId,
        reason: reason ?? "conflict_resolution",
        userId: auth.userId,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error },
          { status: 400, headers: noStore },
        );
      }
      booking.status = "cancelled";
    } else if (action === "confirm_manual") {
      booking.status = "confirmed";
    } else {
      booking.status = "cancelled";
    }

    await booking.save();
    await auditLog({
      action: `conflict.${action}`,
      targetType: "booking",
      targetId: bookingId,
      userId: auth.userId,
      metadata: { reason },
    });

    return NextResponse.json(
      { ok: true, status: booking.status },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[PATCH /api/dashboard/conflicts]", e);
    return NextResponse.json(
      { error: "Failed to resolve conflict" },
      { status: 500, headers: noStore },
    );
  }
}
