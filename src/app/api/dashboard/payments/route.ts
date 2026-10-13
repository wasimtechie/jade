import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { BookingModel } from "@/models/Booking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

/** Razorpay payment activity from confirmed bookings. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/payments", "read");
  if (!auth.ok) return auth.response;

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 100),
    200,
  );

  try {
    await connectDB();
    const docs = await BookingModel.find({
      isDeleted: false,
      "payment.status": {
        $in: [
          "paid",
          "deposit_paid",
          "refunded",
          "partially_refunded",
          "failed",
        ],
      },
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("villaId", "name slug")
      .select(
        "bookingToken guestDetails checkIn checkOut status payment pricing updatedAt villaId",
      )
      .lean();

    const payments = docs.map((b) => {
      const p = (b.payment ?? {}) as Record<string, unknown>;
      const pricing = (b.pricing ?? {}) as { totalPaise?: number };
      const guest = (b.guestDetails ?? {}) as {
        name?: string;
        fullName?: string;
        email?: string;
      };
      const villa = b.villaId as { name?: string; slug?: string } | null;
      return {
        id: String(b._id),
        bookingToken: b.bookingToken,
        villaName: villa?.name ?? "—",
        villaSlug: villa?.slug ?? null,
        guestName: guest.name ?? guest.fullName ?? "—",
        guestEmail: guest.email ?? null,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        bookingStatus: b.status,
        paymentStatus: p.status ?? "pending",
        orderId: p.orderId ?? null,
        paymentId: p.paymentId ?? null,
        amountDuePaise: p.amountDuePaise ?? pricing.totalPaise ?? 0,
        depositPaise: p.depositPaise ?? 0,
        depositPaidPaise: p.depositPaidPaise ?? 0,
        refundedPaise: p.refundedPaise ?? 0,
        totalPaise: pricing.totalPaise ?? 0,
        updatedAt: b.updatedAt ?? null,
      };
    });

    return NextResponse.json({ payments }, { headers: noStore });
  } catch (e) {
    console.error("[GET /api/dashboard/payments]", e);
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500, headers: noStore },
    );
  }
}
