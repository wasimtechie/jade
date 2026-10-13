import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BookingModel } from "@/models/Booking";
import {
  pushAxisRoomsCancellation,
  pushAxisRoomsReservation,
} from "@/lib/axisRooms/client";
import { markBookingSyncResult } from "@/lib/axisRooms/sync";
import { isAxisRoomsEnabled } from "@/lib/axisRooms/config";

export const dynamic = "force-dynamic";

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAxisRoomsEnabled()) {
    return NextResponse.json({ ok: true, blocked: "Axis Rooms integration is paused", processed: 0 });
  }

  if (!process.env.AXIS_ROOMS_API_KEY?.trim()) {
    return NextResponse.json({
      ok: true,
      blocked: "AXIS_ROOMS_API_KEY not configured — see DEPLOYMENT.md",
      processed: 0,
    });
  }

  try {
    await connectDB();
    const pending = await BookingModel.find({
      $or: [
        {
          status: { $in: ["confirmed", "on_hold"] },
          axisRoomsSynced: false,
          axisRoomsSyncAttempts: { $lt: 10 },
        },
        {
          status: "cancelled",
          axisRoomsCancelSynced: false,
          axisRoomsSyncAttempts: { $lt: 10 },
        },
      ],
    }).limit(20);

    let processed = 0;
    for (const b of pending) {
      try {
        if (
          ["confirmed", "on_hold"].includes(b.status) &&
          !b.axisRoomsSynced
        ) {
          const result = await pushAxisRoomsReservation(b);
          await markBookingSyncResult(String(b._id), result, "close");
        } else if (b.status === "cancelled" && !b.axisRoomsCancelSynced) {
          const result = await pushAxisRoomsCancellation(b);
          await markBookingSyncResult(String(b._id), result, "open");
        }
        processed += 1;
      } catch (e) {
        const doc = await BookingModel.findById(b._id);
        if (doc) {
          doc.axisRoomsLastError = e instanceof Error ? e.message : "unknown";
          doc.axisRoomsSyncAttempts = (doc.axisRoomsSyncAttempts ?? 0) + 1;
          await doc.save();
        }
      }
    }

    return NextResponse.json({ ok: true, processed });
  } catch (e) {
    console.error("[cron/axisrooms-retry]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
