import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { fetchConnectedOtas } from "@/lib/axisRooms/connectedOtas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

/** API 13 — connected OTAs for this PMS channel. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/axis-rooms", "read");
  if (!auth.ok) return auth.response;

  const result = await fetchConnectedOtas();
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to fetch connected OTAs" },
      { status: 502, headers: noStore },
    );
  }

  return NextResponse.json({ otas: result.otas }, { headers: noStore });
}
