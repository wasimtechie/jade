import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { requireRole } from "@/lib/auth/requireRole";
import {
  inferFolderFromContext,
  processAndUploadDocument,
} from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

/** Upload villa brochure (PDF / Word / PowerPoint) to GridFS. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const contextSlug = String(
      form.get("villaSlug") ?? form.get("context") ?? "general",
    );
    const folderSlug =
      String(form.get("folderSlug") ?? "") ||
      inferFolderFromContext(contextSlug).replace(/images$/, "documents");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, DOCX, PPT, PPTX allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max 25 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processAndUploadDocument({
      buffer,
      originalFilename: file.name,
      mime: file.type,
      folderSlug: folderSlug.includes("document")
        ? folderSlug
        : "villa-documents",
      uploadedBy: auth.userId,
      contextSlug,
    });

    await auditLog({
      action: "content.save",
      targetType: "media_asset",
      targetId: String(result.asset._id),
      userId: auth.userId,
      metadata: {
        gridFsId: result.gridFsId,
        folderSlug,
        kind: "brochure",
      },
    });

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      mime: result.mime,
      size: result.size,
    });
  } catch (e) {
    console.error("[POST /api/dashboard/media/upload-document]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
