import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { listMediaAssets } from "@/lib/media/mediaService";
import {
  filterStaticItems,
  listPublicRootFolders,
  listStaticMediaUrls,
} from "@/lib/media/staticCatalog";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" } as const;

/** Villa editor + media library — read for image picker overlay. */
async function authorizePicker(req: NextRequest) {
  const media = await requireRole(req, "/dashboard/media", "read");
  if (media.ok) return media;
  return requireRole(req, "/dashboard/settings/villas", "read");
}

/** Lightweight picker feed — static manifest (no Mongo) or uploads list. */
export async function GET(req: NextRequest) {
  const auth = await authorizePicker(req);
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  const source = sp.get("source") === "uploads" ? "uploads" : "static";
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const limit = Math.min(80, Math.max(1, Number(sp.get("limit") ?? "60")));
  const q = sp.get("q")?.trim() || undefined;
  const publicFolders = listPublicRootFolders();

  try {
    if (source === "static") {
      const folder = sp.get("folder")?.trim() || "Villa_Retreats";
      const mime = sp.get("mime") ?? undefined;
      const all = filterStaticItems(listStaticMediaUrls(folder), { q, mime });
      const start = (page - 1) * limit;
      const slice = all.slice(start, start + limit);
      return NextResponse.json(
        {
          items: slice.map((s) => ({
            _id: s.id,
            storage: "static" as const,
            publicUrl: s.publicUrl,
            filename: s.filename,
            alt: "",
          })),
          total: all.length,
          page,
          limit,
          publicFolders,
        },
        { headers: noStore },
      );
    }

    const result = await listMediaAssets({
      source: "uploads",
      page,
      limit,
      q,
      folder: sp.get("uploadFolder") ?? undefined,
    });

    return NextResponse.json(
      {
        items: (result.items ?? []).map((item) => ({
          _id: item._id,
          storage: item.storage,
          publicUrl: item.publicUrl,
          filename: item.filename,
          alt: item.alt,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
        publicFolders,
        folders: result.folders,
      },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/media/picker]", e);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
