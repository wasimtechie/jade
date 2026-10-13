import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { reorderFeaturedBlogs } from "@/lib/cms/blogAdmin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  pageKeys: z.array(z.string()).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await reorderFeaturedBlogs(parsed.data.pageKeys, auth.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
