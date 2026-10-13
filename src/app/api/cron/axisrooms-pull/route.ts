import { NextRequest, NextResponse } from "next/server";
import { reconcileAxisRoomsPull } from "@/lib/axisRooms/pullBooking";
import { isAxisRoomsEnabled } from "@/lib/axisRooms/config";

export const dynamic = "force-dynamic";

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Nightly safety-net — pull OTA bookings missed by webhook (API 12). */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAxisRoomsEnabled()) {
    return NextResponse.json({ ok: true, blocked: "Axis Rooms integration is paused", summary: null });
  }

  if (!process.env.AXIS_ROOMS_API_KEY?.trim()) {
    return NextResponse.json({
      ok: true,
      blocked: "AXIS_ROOMS_API_KEY not configured — see DEPLOYMENT.md",
      summary: null,
    });
  }

  try {
    const summary = await reconcileAxisRoomsPull();
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    console.error("[cron/axisrooms-pull]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
