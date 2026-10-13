import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { VillaModel } from "@/models/Villa";
import { isAxisRoomsMapped, villaAxisRoomsMapping } from "@/lib/axisRooms/mapBooking";
import {
  blockChannelInventory,
  unblockChannelInventory,
} from "@/lib/axisRooms/channels";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

const bodySchema = z.object({
  villaSlug: z.string().min(1),
  action: z.enum(["pause", "resume"]),
  otaIds: z.array(z.number().int().positive()).min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** APIs 3/4 — pause or resume inventory on specific OTAs for a villa date range. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/axis-rooms", "write");
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

  const { villaSlug, action, otaIds, startDate, endDate } = parsed.data;

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
    const hotelId = mapping.propertyId!;
    const roomId = mapping.roomTypeId!;

    const result =
      action === "pause"
        ? await blockChannelInventory({
            hotelId,
            roomId,
            startDate,
            endDate,
            otaIds,
            auditTargetId: String(villa._id),
          })
        : await unblockChannelInventory({
            hotelId,
            roomId,
            startDate,
            endDate,
            otaIds,
            auditTargetId: String(villa._id),
          });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Channel control failed" },
        { status: 502, headers: noStore },
      );
    }

    return NextResponse.json({ ok: true, action }, { headers: noStore });
  } catch (e) {
    console.error("[POST /api/dashboard/settings/axis-rooms/channel-control]", e);
    return NextResponse.json(
      { error: "Channel control failed" },
      { status: 500, headers: noStore },
    );
  }
}
