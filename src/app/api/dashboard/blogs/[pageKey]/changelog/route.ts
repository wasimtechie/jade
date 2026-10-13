import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { getBlogChangelog } from "@/lib/cms/blogAdmin";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { pageKey: string } };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "read");
  if (!auth.ok) return auth.response;

  try {
    const logs = await getBlogChangelog(decodeURIComponent(ctx.params.pageKey));
    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
