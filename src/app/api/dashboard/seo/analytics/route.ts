import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { BookingModel } from "@/models/Booking";
import { LeadModel } from "@/models/Lead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Lightweight ops analytics — booking & lead counts. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/analytics", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      bookingsTotal,
      bookingsConfirmed,
      bookingsPending,
      leads30d,
      paidRevenueAgg,
    ] = await Promise.all([
      BookingModel.countDocuments({ isDeleted: false }),
      BookingModel.countDocuments({ isDeleted: false, status: "confirmed" }),
      BookingModel.countDocuments({ isDeleted: false, status: "pending" }),
      LeadModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      BookingModel.aggregate([
        {
          $match: {
            isDeleted: false,
            "payment.status": { $in: ["paid", "deposit_paid"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$pricing.totalPaise" } } },
      ]),
    ]);

    const paidRevenuePaise = paidRevenueAgg[0]?.total ?? 0;

    return NextResponse.json({
      periodDays: 30,
      bookings: {
        total: bookingsTotal,
        confirmed: bookingsConfirmed,
        pending: bookingsPending,
      },
      leadsLast30Days: leads30d,
      paidRevenuePaise,
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? null,
    });
  } catch (e) {
    console.error("[GET /api/dashboard/seo/analytics]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
