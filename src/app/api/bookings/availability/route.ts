import { NextRequest, NextResponse } from "next/server";
import { findVillaBySlug, getBookingStore } from "@/lib/bookings/mongoStore";
import { isMongoConfigured } from "@/lib/db";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const villaKey =
    searchParams.get("publicVillaId") ??
    searchParams.get("villaSlug") ??
    searchParams.get("villaId");
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  const ip = req.ip ?? getClientIpFromHeaders(req.headers);
  const rl = rateLimit({
    key: `bookings:availability:${ip}`,
    limit: 120,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  if (!villaKey || isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json(
      { error: "Valid publicVillaId/villaSlug, year, and month are required" },
      { status: 400 },
    );
  }

  const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
  const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  if (!isMongoConfigured()) {
    return NextResponse.json({ bookedDates: [], blockedDates: [] });
  }

  try {
    const villa = await findVillaBySlug(villaKey);
    if (!villa) {
      return NextResponse.json({ bookedDates: [], blockedDates: [] });
    }
    const villaId = "_id" in villa ? String(villa._id) : villa.slug;
    const store = getBookingStore();
    const { bookedDates, blockedDates } = await store.getAvailability(
      villaId,
      firstDay,
      lastDay,
    );
    return NextResponse.json({ bookedDates, blockedDates });
  } catch (err) {
    console.error("[GET /api/bookings/availability]", err);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
