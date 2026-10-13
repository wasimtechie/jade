import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { BookingModel } from "@/models/Booking";
import { LeadModel } from "@/models/Lead";
import { z } from "zod";

export const dynamic = "force-dynamic";

const erasureSchema = z.object({
  email: z.string().email(),
  bookingToken: z.string().min(16).optional(),
  confirm: z.literal(true),
});

/** DPDP PII erasure — scrubs guest PII from bookings/leads; retains financial audit trail. */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = erasureSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    await connectDB();

    const bookingFilter = parsed.data.bookingToken
      ? { bookingToken: parsed.data.bookingToken, "guestDetails.email": email }
      : { "guestDetails.email": email };

    const bookingResult = await BookingModel.updateMany(bookingFilter, {
      $set: {
        "guestDetails.name": "[erased]",
        "guestDetails.email": "[erased]",
        "guestDetails.phone": "[erased]",
        notes: "[erased]",
      },
    });

    const leadResult = await LeadModel.updateMany(
      { email, isDeleted: false },
      {
        $set: {
          name: "[erased]",
          email: "[erased]",
          phone: "[erased]",
          message: "[erased]",
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
    );

    await auditLog({
      action: "dpdp.erasure",
      targetType: "pii",
      metadata: {
        emailHash: Buffer.from(email).toString("base64").slice(0, 16),
        bookings: bookingResult.modifiedCount,
        leads: leadResult.modifiedCount,
      },
    });

    return NextResponse.json({
      ok: true,
      bookingsErased: bookingResult.modifiedCount,
      leadsErased: leadResult.modifiedCount,
    });
  } catch (e) {
    console.error("[POST /api/privacy/erasure]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
