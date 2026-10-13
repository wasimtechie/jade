import sharp from "sharp";
import { connectDB } from "@/lib/db";
import { uploadToGridFS, deleteFromGridFS } from "@/lib/storage/gridfs";
import { MediaAssetModel } from "@/models/MediaAsset";
import { MediaFolderModel } from "@/models/MediaFolder";
import { DEFAULT_MEDIA_FOLDERS } from "@/lib/media/defaultFolders";
import {
  filterStaticItems,
  listPublicRootFolders,
  listStaticMediaUrls,
  staticItemFromUrl,
  type StaticMediaItem,
} from "@/lib/media/staticCatalog";
import { findMediaUsage } from "@/lib/media/usageScanner";

export const CMS_MEDIA_BUCKET = "cms-media";

export type MediaListItem = {
  _id: string;
  storage: "gridfs" | "static";
  publicUrl: string;
  filename: string;
  mime: string;
  size?: number;
  width?: number;
  height?: number;
  folderSlug: string;
  alt: string;
  caption: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  missingAlt: boolean;
  usageCount: number;
  gridFsId?: string;
};

export async function ensureDefaultFolders() {
  await connectDB();
  for (const f of DEFAULT_MEDIA_FOLDERS) {
    await MediaFolderModel.updateOne(
      { slug: f.slug },
      {
        $setOnInsert: {
          slug: f.slug,
          label: f.label,
          sortOrder: f.sortOrder,
          isSystem: true,
        },
      },
      { upsert: true },
    );
  }
}

export function inferFolderFromContext(contextSlug: string): string {
  if (contextSlug.startsWith("blog/")) return "blog-images";
  if (contextSlug.startsWith("villa/")) return "villa-images";
  if (contextSlug.includes("experience")) return "experience-images";
  if (contextSlug.includes("seo")) return "seo-assets";
  return "general-assets";
}

export function publicUrlForGridFs(id: string): string {
  return `/api/cms/media/${id}`;
}

export async function processAndUploadImage(params: {
  buffer: Buffer;
  originalFilename: string;
  mime: string;
  folderSlug: string;
  uploadedBy: string;
  contextSlug?: string;
}) {
  const folderSlug =
    params.folderSlug ||
    inferFolderFromContext(params.contextSlug ?? "general");

  const meta = await sharp(params.buffer).metadata();
  const width = meta.width;
  const height = meta.height;

  const safeName = params.originalFilename.replace(/[^\w.\-]+/g, "_");
  const basePath = `${folderSlug}/${Date.now()}-${safeName}`;

  const { gridFsId, size } = await uploadToGridFS({
    filename: basePath,
    mime: params.mime,
    buffer: params.buffer,
    bucketName: CMS_MEDIA_BUCKET,
  });

  const variants: {
    label: string;
    gridFsId: string;
    url: string;
    width?: number;
    height?: number;
    mime: string;
    size: number;
  }[] = [];

  if (params.mime !== "image/webp" && params.mime !== "image/svg+xml") {
    try {
      const webpBuf = await sharp(params.buffer)
        .webp({ quality: 82 })
        .toBuffer();
      const webpMeta = await sharp(webpBuf).metadata();
      const webpUpload = await uploadToGridFS({
        filename: `${basePath}.webp`,
        mime: "image/webp",
        buffer: webpBuf,
        bucketName: CMS_MEDIA_BUCKET,
      });
      variants.push({
        label: "webp",
        gridFsId: webpUpload.gridFsId,
        url: publicUrlForGridFs(webpUpload.gridFsId),
        width: webpMeta.width,
        height: webpMeta.height,
        mime: "image/webp",
        size: webpUpload.size,
      });
    } catch {
      /* non-fatal */
    }
  }

  const publicUrl = publicUrlForGridFs(gridFsId);
  const asset = await MediaAssetModel.create({
    storage: "gridfs",
    gridFsId,
    bucket: CMS_MEDIA_BUCKET,
    publicUrl,
    originalFilename: params.originalFilename,
    filename: safeName,
    mime: params.mime,
    size,
    width,
    height,
    folderSlug,
    alt: "",
    caption: "",
    tags: [],
    variants,
    uploadedBy: params.uploadedBy,
    status: "active",
  });

  return {
    asset,
    url: variants.find((v) => v.label === "webp")?.url ?? publicUrl,
    gridFsId,
    size,
    width,
    height,
    variants,
  };
}

const DOCUMENT_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

/** Store villa brochure / document in GridFS (no image processing). */
export async function processAndUploadDocument(params: {
  buffer: Buffer;
  originalFilename: string;
  mime: string;
  folderSlug: string;
  uploadedBy: string;
  contextSlug?: string;
}) {
  if (!DOCUMENT_MIMES.has(params.mime)) {
    throw new Error("Unsupported document type");
  }

  const folderSlug =
    params.folderSlug ||
    inferFolderFromContext(params.contextSlug ?? "general");

  const safeName = params.originalFilename.replace(/[^\w.\-]+/g, "_");
  const basePath = `${folderSlug}/${Date.now()}-${safeName}`;

  const { gridFsId, size } = await uploadToGridFS({
    filename: basePath,
    mime: params.mime,
    buffer: params.buffer,
    bucketName: CMS_MEDIA_BUCKET,
  });

  const publicUrl = publicUrlForGridFs(gridFsId);
  const asset = await MediaAssetModel.create({
    storage: "gridfs",
    gridFsId,
    bucket: CMS_MEDIA_BUCKET,
    publicUrl,
    originalFilename: params.originalFilename,
    filename: safeName,
    mime: params.mime,
    size,
    folderSlug,
    alt: "",
    caption: "",
    tags: ["brochure"],
    variants: [],
    uploadedBy: params.uploadedBy,
    status: "active",
  });

  return {
    asset,
    url: publicUrl,
    filename: safeName,
    gridFsId,
    size,
    mime: params.mime,
  };
}

type ListParams = {
  q?: string;
  folder?: string;
  mime?: string;
  source?: "all" | "uploads" | "static";
  usage?: "used" | "unused";
  date?: "today" | "week" | "month";
  page?: number;
  limit?: number;
};

export async function listMediaAssets(params: ListParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 48));
  const source = params.source ?? "all";

  /** Public-site picker — manifest only, no Mongo (avoids slow races with uploads tab). */
  if (source === "static") {
    const publicFolders = listPublicRootFolders();
    const allStatic = filterStaticItems(
      listStaticMediaUrls(params.folder),
      { q: params.q, mime: params.mime },
    );
    const start = (page - 1) * limit;
    const slice = allStatic.slice(start, start + limit);
    const items = slice.map((s) => ({
      _id: s.id,
      storage: "static" as const,
      publicUrl: s.publicUrl,
      filename: s.filename,
      mime: s.mime,
      size: s.size,
      width: s.width,
      height: s.height,
      folderSlug: s.folderPath.split("/")[0] || "public-site",
      alt: "",
      caption: "",
      tags: [] as string[],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      missingAlt: true,
      usageCount: 0,
    }));
    return {
      items,
      total: allStatic.length,
      page,
      limit,
      folders: [],
      publicFolders,
    };
  }

  await ensureDefaultFolders();

  const uploadItems: MediaListItem[] = [];
  if (source === "all" || source === "uploads") {
    const filter: Record<string, unknown> = { status: "active" };
    if (params.folder) filter.folderSlug = params.folder;
    if (params.mime) filter.mime = new RegExp(params.mime, "i");

    if (params.date) {
      const now = new Date();
      const start = new Date();
      if (params.date === "today") start.setHours(0, 0, 0, 0);
      else if (params.date === "week") start.setDate(now.getDate() - 7);
      else start.setMonth(now.getMonth() - 1);
      filter.createdAt = { $gte: start };
    }

    const q = params.q?.trim();
    if (q) {
      filter.$or = [
        { originalFilename: new RegExp(q, "i") },
        { filename: new RegExp(q, "i") },
        { alt: new RegExp(q, "i") },
        { caption: new RegExp(q, "i") },
        { tags: new RegExp(q, "i") },
        { publicUrl: new RegExp(q, "i") },
      ];
    }

    const docs = await MediaAssetModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(source === "uploads" ? (page - 1) * limit : 0)
      .limit(source === "uploads" ? limit : 500)
      .lean();

    for (const d of docs) {
      uploadItems.push({
        _id: String(d._id),
        storage: "gridfs",
        publicUrl: String(d.publicUrl),
        filename: String(d.filename ?? d.originalFilename ?? "file"),
        mime: String(d.mime ?? "image/jpeg"),
        size: d.size as number | undefined,
        width: d.width as number | undefined,
        height: d.height as number | undefined,
        folderSlug: String(d.folderSlug ?? "general-assets"),
        alt: String(d.alt ?? ""),
        caption: String(d.caption ?? ""),
        tags: (d.tags as string[]) ?? [],
        createdAt: new Date(d.createdAt as Date).toISOString(),
        updatedAt: new Date(d.updatedAt as Date).toISOString(),
        missingAlt: !String(d.alt ?? "").trim(),
        usageCount: 0,
        gridFsId: d.gridFsId ? String(d.gridFsId) : undefined,
      });
    }
  }

  let staticItems: StaticMediaItem[] = [];
  if (source === "all") {
    const allStatic = filterStaticItems(
      listStaticMediaUrls(params.folder),
      {
        q: params.q,
        folder: params.folder,
        mime: params.mime,
      },
    );
    staticItems = allStatic.slice(0, 200);
  }

  const staticList: MediaListItem[] = staticItems.map((s) => ({
    _id: s.id,
    storage: "static" as const,
    publicUrl: s.publicUrl,
    filename: s.filename,
    mime: s.mime,
    size: s.size,
    width: s.width,
    height: s.height,
    folderSlug: s.folderPath.split("/")[0] || "public-site",
    alt: "",
    caption: "",
    tags: [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    missingAlt: true,
    usageCount: 0,
  }));

  let combined =
    source === "uploads"
      ? uploadItems
      : [...uploadItems, ...staticList];

  if (params.usage === "used" || params.usage === "unused") {
    combined = await Promise.all(
      combined.map(async (item) => {
        const usage = await findMediaUsage(
          item.publicUrl,
          item.gridFsId,
        );
        return { ...item, usageCount: usage.length };
      }),
    );
    combined = combined.filter((i) =>
      params.usage === "used" ? i.usageCount > 0 : i.usageCount === 0,
    );
  }

  const publicFolders = listPublicRootFolders();

  if (source === "all") {
    combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = combined.length;
    const start = (page - 1) * limit;
    const items = combined.slice(start, start + limit);
    const folders = await MediaFolderModel.find().sort({ sortOrder: 1 }).lean();
    return {
      items,
      total,
      page,
      limit,
      folders: folders.map((f) => ({
        slug: String(f.slug),
        label: String(f.label),
        isSystem: Boolean(f.isSystem),
        parentSlug: f.parentSlug ? String(f.parentSlug) : null,
      })),
      publicFolders,
    };
  }

  const uploadTotal = await MediaAssetModel.countDocuments({ status: "active" });
  const total = uploadTotal;
  const items = combined;

  const folders = await MediaFolderModel.find().sort({ sortOrder: 1 }).lean();

  return {
    items,
    total,
    page,
    limit,
    folders: folders.map((f) => ({
      slug: String(f.slug),
      label: String(f.label),
      isSystem: Boolean(f.isSystem),
      parentSlug: f.parentSlug ? String(f.parentSlug) : null,
    })),
    publicFolders,
  };
}

export async function upsertStaticMetadata(
  publicUrl: string,
  patch: {
    alt?: string;
    caption?: string;
    tags?: string[];
    folderSlug?: string;
  },
) {
  const item = staticItemFromUrl(publicUrl);
  const asset = await MediaAssetModel.findOneAndUpdate(
    { storage: "static", publicUrl },
    {
      $set: {
        storage: "static",
        publicUrl,
        filename: item.filename,
        mime: item.mime,
        folderSlug: patch.folderSlug ?? "public-site",
        ...patch,
        status: "active",
      },
      $setOnInsert: {
        alt: patch.alt ?? "",
        caption: patch.caption ?? "",
        tags: patch.tags ?? [],
      },
    },
    { upsert: true, new: true },
  );
  return asset;
}

export async function deleteMediaAsset(
  id: string,
  userId: string,
  force = false,
) {
  const asset = await MediaAssetModel.findById(id);
  if (!asset || asset.status === "deleted") return { ok: false, error: "Not found" };

  if (asset.storage === "static") {
    await MediaAssetModel.findByIdAndDelete(id);
    return { ok: true };
  }

  const usage = await findMediaUsage(
    asset.publicUrl,
    asset.gridFsId ?? undefined,
  );
  if (usage.length && !force) {
    return { ok: false, error: "in_use", usage };
  }

  if (asset.gridFsId) {
    await deleteFromGridFS(asset.gridFsId, asset.bucket);
    for (const v of asset.variants ?? []) {
      if (v.gridFsId) await deleteFromGridFS(v.gridFsId, asset.bucket);
    }
  }

  asset.status = "deleted";
  asset.deletedAt = new Date();
  asset.deletedBy = userId as unknown as import("mongoose").Types.ObjectId;
  await asset.save();
  return { ok: true };
}
