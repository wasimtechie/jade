import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { MediaAssetModel } from "@/models/MediaAsset";
import {
  deleteMediaAsset,
  upsertStaticMetadata,
} from "@/lib/media/mediaService";
import { findMediaUsage } from "@/lib/media/usageScanner";
import { staticItemFromUrl } from "@/lib/media/staticCatalog";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/media", "read");
  if (!auth.ok) return auth.response;

  const id = decodeURIComponent(params.id);
  if (id.startsWith("static:")) {
    const publicUrl = id.replace(/^static:/, "");
    const item = staticItemFromUrl(publicUrl);
    await connectDB();
    const override = await MediaAssetModel.findOne({
      storage: "static",
      publicUrl,
      status: "active",
    }).lean();
    const usage = await findMediaUsage(publicUrl);
    return NextResponse.json({
      asset: {
        _id: id,
        storage: "static",
        publicUrl,
        filename: item.filename,
        mime: item.mime,
        folderSlug: override?.folderSlug ?? "public-site",
        alt: override?.alt ?? "",
        caption: override?.caption ?? "",
        tags: override?.tags ?? [],
        missingAlt: !String(override?.alt ?? "").trim(),
      },
      usage,
    });
  }

  await connectDB();
  const asset = await MediaAssetModel.findOne({
    _id: id,
    status: "active",
  }).lean();
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const usage = await findMediaUsage(
    String(asset.publicUrl),
    asset.gridFsId ? String(asset.gridFsId) : undefined,
  );
  return NextResponse.json({
    asset: {
      ...asset,
      _id: String(asset._id),
      missingAlt: !String(asset.alt ?? "").trim(),
    },
    usage,
  });
}

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const id = decodeURIComponent(params.id);
  const body = (await req.json()) as {
    alt?: string;
    caption?: string;
    tags?: string[];
    folderSlug?: string;
    publicUrl?: string;
  };

  if (id.startsWith("static:")) {
    const publicUrl = body.publicUrl ?? id.replace(/^static:/, "");
    const asset = await upsertStaticMetadata(publicUrl, body);
    return NextResponse.json({ asset });
  }

  await connectDB();
  const asset = await MediaAssetModel.findOneAndUpdate(
    { _id: id, status: "active" },
    {
      ...(body.alt !== undefined ? { alt: body.alt } : {}),
      ...(body.caption !== undefined ? { caption: body.caption } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.folderSlug !== undefined ? { folderSlug: body.folderSlug } : {}),
    },
    { new: true },
  );
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await auditLog({
    action: "content.save",
    targetType: "media_asset",
    targetId: id,
    userId: auth.userId,
  });

  return NextResponse.json({ asset });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const force = req.nextUrl.searchParams.get("force") === "1";
  const id = decodeURIComponent(params.id);

  if (id.startsWith("static:")) {
    const publicUrl = id.replace(/^static:/, "");
    await connectDB();
    await MediaAssetModel.deleteOne({ storage: "static", publicUrl });
    return NextResponse.json({ ok: true });
  }

  const result = await deleteMediaAsset(id, auth.userId, force);
  if (!result.ok) {
    if (result.error === "in_use") {
      return NextResponse.json(
        { error: "Asset is in use", usage: result.usage },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  await auditLog({
    action: "content.save",
    targetType: "media_asset",
    targetId: id,
    userId: auth.userId,
    metadata: { deleted: true, force },
  });

  return NextResponse.json({ ok: true });
}
