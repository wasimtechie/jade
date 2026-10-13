import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { bulkBlogAction } from "@/lib/cms/blogAdmin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  pageKeys: z.array(z.string().min(1)).min(1).max(100),
  action: z.enum([
    "publish",
    "unpublish",
    "archive",
    "delete",
    "restore",
    "set_category",
    "set_author",
    "add_tags",
    "remove_tags",
    "feature",
    "unfeature",
    "set_noindex",
    "set_index",
  ]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = bulkSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const results = await bulkBlogAction(
      parsed.data.pageKeys,
      parsed.data.action,
      auth.userId,
      parsed.data.payload,
    );
    return NextResponse.json({ results });
  } catch (e) {
    console.error("[POST /api/dashboard/blogs/bulk]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
