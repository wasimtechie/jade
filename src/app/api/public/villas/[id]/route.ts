import { NextRequest, NextResponse } from "next/server";
import { resolvePublicVilla } from "@/lib/villas/resolvePublicVilla";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public villa detail — dashboard edits reflect here after save. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const villa = await resolvePublicVilla(params.id);
    if (!villa) {
      return NextResponse.json({ error: "Villa not found" }, { status: 404 });
    }
    return NextResponse.json(
      { villa, source: "merged" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (e) {
    console.error("[GET /api/public/villas/[id]]", e);
    return NextResponse.json({ error: "Failed to load villa" }, { status: 500 });
  }
}
