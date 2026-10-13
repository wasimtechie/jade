import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { connectDB } from "@/lib/db";
import { MediaAssetModel } from "@/models/MediaAsset";
import { deleteMediaAsset } from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as {
    action?: "move" | "tag" | "delete";
    ids?: string[];
    folderSlug?: string;
    tags?: string[];
    force?: boolean;
  };

  if (!body.action || !body.ids?.length) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();

  if (body.action === "move" && body.folderSlug) {
    await MediaAssetModel.updateMany(
      { _id: { $in: body.ids.filter((id) => !id.startsWith("static:")) } },
      { $set: { folderSlug: body.folderSlug } },
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "tag" && body.tags) {
    await MediaAssetModel.updateMany(
      { _id: { $in: body.ids.filter((id) => !id.startsWith("static:")) } },
      { $set: { tags: body.tags } },
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete") {
    const errors: { id: string; error: string }[] = [];
    for (const id of body.ids) {
      if (id.startsWith("static:")) continue;
      const result = await deleteMediaAsset(id, auth.userId, body.force);
      if (!result.ok && result.error === "in_use") {
        errors.push({ id, error: "in_use" });
      }
    }
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
