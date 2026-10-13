import { NextRequest, NextResponse } from "next/server";
import { readFromGridFS } from "@/lib/storage/gridfs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public CMS images (landing hero, etc.) — WebP from GridFS. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const file = await readFromGridFS(params.id, "cms-media");
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.mime || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[GET /api/cms/media/[id]]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
