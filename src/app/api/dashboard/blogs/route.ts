import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { withMongo } from "@/lib/api/mongoRoute";
import { duplicateBlogPost, listBlogPosts } from "@/lib/cms/blogAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, "/dashboard/seo", "read");
    if (!auth.ok) return auth.response;

    const sp = req.nextUrl.searchParams;
    const result = await withMongo(() =>
      listBlogPosts({
        q: sp.get("q") ?? undefined,
        status: sp.get("status") ?? undefined,
        category: sp.get("category") ?? undefined,
        author: sp.get("author") ?? undefined,
        tag: sp.get("tag") ?? undefined,
        dateFrom: sp.get("dateFrom") ?? undefined,
        dateTo: sp.get("dateTo") ?? undefined,
        seoScore: (sp.get("seoScore") as "good" | "fair" | "poor") ?? undefined,
        schemaType: sp.get("schemaType") ?? undefined,
        featured: sp.get("featured") === "1",
        includeTrashed: sp.get("includeTrashed") === "1",
        page: Number(sp.get("page") ?? "1"),
        limit: Number(sp.get("limit") ?? "50"),
        sort: (sp.get("sort") as "updated" | "published" | "title") ?? "updated",
      }),
    );
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/dashboard/blogs] unhandled", e);
    const detail = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json(
      { error: "Failed to load blogs", code: "BLOG_LIST_ERROR", detail },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { action?: string; pageKey?: string };
    if (body.action === "duplicate" && body.pageKey) {
      const page = await duplicateBlogPost(body.pageKey, auth.userId);
      return NextResponse.json({ page }, { status: 201 });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    console.error("[POST /api/dashboard/blogs]", e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
