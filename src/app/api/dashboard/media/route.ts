import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { listMediaAssets } from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "read");
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  try {
    const result = await listMediaAssets({
      q: sp.get("q") ?? undefined,
      folder: sp.get("folder") ?? undefined,
      mime: sp.get("mime") ?? undefined,
      source: (sp.get("source") as "all" | "uploads" | "static") ?? "uploads",
      usage: (sp.get("usage") as "used" | "unused") ?? undefined,
      date: (sp.get("date") as "today" | "week" | "month") ?? undefined,
      page: Number(sp.get("page") ?? "1"),
      limit: Number(sp.get("limit") ?? "48"),
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/dashboard/media]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
