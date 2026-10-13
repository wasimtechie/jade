import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { nowIST } from "@/lib/bookingDates";

export const dynamic = "force-dynamic";

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Expire pending bookings — cron-only soft expire (no TTL delete). */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const store = getBookingStore();
    const count = await store.expirePending(nowIST());
    return NextResponse.json({ ok: true, expired: count });
  } catch (e) {
    console.error("[cron/expire-pending-bookings]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
