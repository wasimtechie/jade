import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { readFromGridFS } from "@/lib/storage/gridfs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Serve uploaded dashboard media from GridFS. */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/settings/villas", "read");
  if (!auth.ok) return auth.response;

  try {
    const file = await readFromGridFS(params.id, "villa-media");
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[GET /api/media/[id]]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
