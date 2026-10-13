import { NextRequest, NextResponse } from "next/server";
import { resolvePublicVillaList } from "@/lib/villas/resolvePublicVilla";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public villa directory — Mongo overrides merged with static retreats. */
export async function GET() {
  try {
    const villas = await resolvePublicVillaList();
    return NextResponse.json(
      { villas },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (e) {
    console.error("[GET /api/public/villas]", e);
    return NextResponse.json({ error: "Failed to load villas" }, { status: 500 });
  }
}
