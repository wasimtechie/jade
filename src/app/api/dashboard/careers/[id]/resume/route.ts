import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { CareerModel } from "@/models/Career";
import { readFromGridFS } from "@/lib/storage/gridfs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Download career application résumé from GridFS (auth-gated). */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/careers", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const doc = await CareerModel.findOne({
      _id: params.id,
      isDeleted: false,
    }).lean();
    if (!doc?.resume?.gridFsId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = await readFromGridFS(doc.resume.gridFsId, "resumes");
    if (!file) {
      return NextResponse.json({ error: "File missing" }, { status: 404 });
    }

    const filename =
      doc.resume.filename ?? `resume-${params.id.slice(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.mime || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[GET /api/dashboard/careers/[id]/resume]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
