import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { getBlogVersions, restoreBlogVersion } from "@/lib/cms/blogAdmin";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { pageKey: string } };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "read");
  if (!auth.ok) return auth.response;

  try {
    const versions = await getBlogVersions(decodeURIComponent(ctx.params.pageKey));
    return NextResponse.json({ versions });
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { versionIndex?: number };
    if (body.versionIndex == null) {
      return NextResponse.json({ error: "versionIndex required" }, { status: 400 });
    }
    const page = await restoreBlogVersion(
      decodeURIComponent(ctx.params.pageKey),
      body.versionIndex,
      auth.userId,
    );
    return NextResponse.json({ page });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
