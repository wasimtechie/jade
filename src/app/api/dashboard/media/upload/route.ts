import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { requireRole } from "@/lib/auth/requireRole";
import {
  inferFolderFromContext,
  processAndUploadImage,
} from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const contextSlug = String(form.get("villaSlug") ?? form.get("context") ?? "general");
    const folderSlug = String(form.get("folderSlug") ?? "") || inferFolderFromContext(contextSlug);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, GIF, SVG allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max 12 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processAndUploadImage({
      buffer,
      originalFilename: file.name,
      mime: file.type,
      folderSlug,
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
        size: result.size,
      },
    });

    return NextResponse.json({
      url: result.url,
      publicUrl: result.url,
      assetId: String(result.asset._id),
      gridFsId: result.gridFsId,
      size: result.size,
      width: result.width,
      height: result.height,
      variants: result.variants,
    });
  } catch (e) {
    console.error("[POST /api/dashboard/media/upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
