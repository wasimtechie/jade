import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { VillaModel } from "@/models/Villa";
import { isAxisRoomsMapped, villaAxisRoomsMapping } from "@/lib/axisRooms/mapBooking";
import { verifyOtaState } from "@/lib/axisRooms/verify";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

const bodySchema = z.object({
  villaSlug: z.string().min(1),
  otaId: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** APIs 5/8 — verify OTA availability + rates vs what Jade pushed. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/axis-rooms", "read");
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const { villaSlug, otaId, startDate, endDate } = parsed.data;

  try {
    await connectDB();
    const villa = await VillaModel.findOne({ slug: villaSlug, isDeleted: false });
    if (!villa || !isAxisRoomsMapped(villa)) {
      return NextResponse.json(
        { error: "Villa not channel-managed or missing Axis mapping" },
        { status: 404, headers: noStore },
      );
    }

    const mapping = villaAxisRoomsMapping(villa);
    const result = await verifyOtaState({
      otaId,
      hotelId: mapping.propertyId!,
      roomId: mapping.roomTypeId!,
      rateplanId: mapping.ratePlanId ?? mapping.roomTypeId!,
      startDate,
      endDate,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Verify failed" },
        { status: 502, headers: noStore },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        availability: result.availability ?? [],
        rates: result.rates ?? [],
      },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[POST /api/dashboard/settings/axis-rooms/verify]", e);
    return NextResponse.json(
      { error: "Verify failed" },
      { status: 500, headers: noStore },
    );
  }
}
