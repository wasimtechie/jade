import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import {
  axisCsvToString,
  listVillasForAxisCsv,
} from "@/lib/axisRooms/onboarding";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Export villa rows for Axis Rooms team CSV onboarding. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/axis-rooms", "read");
  if (!auth.ok) return auth.response;

  try {
    const rows = await listVillasForAxisCsv();
    const csv = axisCsvToString(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="jade-axisrooms-properties.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[GET /api/dashboard/settings/axis-rooms/csv]", e);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
