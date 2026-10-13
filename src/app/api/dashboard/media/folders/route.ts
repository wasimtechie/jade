import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { connectDB } from "@/lib/db";
import { MediaAssetModel } from "@/models/MediaAsset";
import { MediaFolderModel } from "@/models/MediaFolder";
import { ensureDefaultFolders } from "@/lib/media/mediaService";
import { z } from "zod";

export const dynamic = "force-dynamic";

const folderSchema = z.object({
  slug: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  parentSlug: z.string().max(80).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "read");
  if (!auth.ok) return auth.response;

  await ensureDefaultFolders();
  const folders = await MediaFolderModel.find().sort({ sortOrder: 1 }).lean();
  return NextResponse.json({
    folders: folders.map((f) => ({
      slug: String(f.slug),
      label: String(f.label),
      isSystem: Boolean(f.isSystem),
      parentSlug: f.parentSlug ? String(f.parentSlug) : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const parsed = folderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const slug = parsed.data.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await connectDB();
  const existing = await MediaFolderModel.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: "Folder exists" }, { status: 409 });
  }

  const folder = await MediaFolderModel.create({
    slug,
    label: parsed.data.label,
    parentSlug: parsed.data.parentSlug ?? null,
    isSystem: false,
    sortOrder: 50,
  });

  return NextResponse.json({ folder }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as {
    slug?: string;
    label?: string;
    moveAssetsTo?: string;
  };
  if (!body.slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  await connectDB();
  const folder = await MediaFolderModel.findOne({ slug: body.slug });
  if (!folder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (folder.isSystem && body.label) {
    await MediaFolderModel.updateOne(
      { slug: body.slug },
      { $set: { label: body.label } },
    );
  } else if (!folder.isSystem) {
    await MediaFolderModel.updateOne(
      { slug: body.slug },
      {
        $set: {
          ...(body.label ? { label: body.label } : {}),
        },
      },
    );
  }

  if (body.moveAssetsTo) {
    await MediaAssetModel.updateMany(
      { folderSlug: body.slug, status: "active" },
      { $set: { folderSlug: body.moveAssetsTo } },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "write");
  if (!auth.ok) return auth.response;

  const slug = req.nextUrl.searchParams.get("slug");
  const moveTo = req.nextUrl.searchParams.get("moveTo") ?? "general-assets";
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  await connectDB();
  const folder = await MediaFolderModel.findOne({ slug });
  if (!folder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (folder.isSystem) {
    return NextResponse.json({ error: "Cannot delete system folder" }, { status: 400 });
  }

  await MediaAssetModel.updateMany(
    { folderSlug: slug, status: "active" },
    { $set: { folderSlug: moveTo } },
  );
  await MediaFolderModel.deleteOne({ slug });
  return NextResponse.json({ ok: true });
}
