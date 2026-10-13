import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { connectDB } from "@/lib/db";
import { ContentPageModel } from "@/models/ContentPage";
import { runSiteSeoAudit } from "@/lib/seo/siteHealth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/manager", "read");
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  try {
    const report = await runSiteSeoAudit();
    let issues = report.issues;

    const type = sp.get("type");
    const category = sp.get("category");
    const priority = sp.get("priority");
    const q = sp.get("q")?.trim().toLowerCase();

    if (type) issues = issues.filter((i) => i.contentType === type);
    if (category) issues = issues.filter((i) => i.category === category);
    if (priority) issues = issues.filter((i) => i.priority === priority);
    if (q) {
      issues = issues.filter(
        (i) =>
          i.contentName.toLowerCase().includes(q) ||
          i.issueType.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({ issues, summary: report.summary });
  } catch (e) {
    console.error("[GET /api/dashboard/seo/audit]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

const bulkSchema = z.object({
  pageKeys: z.array(z.string()).min(1).max(50),
  field: z.enum(["metaTitle", "metaDescription", "ogImage", "canonicalUrl"]),
  value: z.string().max(500).optional(),
  mode: z.enum(["set", "generate"]).default("set"),
});

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/manager", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = bulkSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const results: { pageKey: string; ok: boolean }[] = [];

    for (const pageKey of parsed.data.pageKeys) {
      const page = await ContentPageModel.findOne({ pageKey });
      if (!page?.meta) {
        results.push({ pageKey, ok: false });
        continue;
      }

      const meta = page.meta as Record<string, unknown>;
      const seo = (meta.seo as Record<string, string>) ?? {};
      const title = String(meta.title ?? "");

      if (parsed.data.mode === "generate") {
        if (parsed.data.field === "metaTitle") seo.metaTitle = title;
        if (parsed.data.field === "metaDescription") {
          seo.ogDescription = String(meta.description ?? meta.excerpt ?? title);
        }
        if (parsed.data.field === "ogImage") {
          seo.ogImage = String(meta.image ?? meta.thumbnailImage ?? "");
        }
        if (parsed.data.field === "canonicalUrl") {
          const slug = String(meta.slug ?? pageKey.replace(/^blog\//, ""));
          seo.canonicalUrl = `https://jadehospitainment.com/${slug}/`;
        }
      } else if (parsed.data.value != null) {
        seo[parsed.data.field] = parsed.data.value;
      }

      meta.seo = seo;
      await ContentPageModel.updateOne({ pageKey }, { meta, updatedBy: auth.userId });
      results.push({ pageKey, ok: true });
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[POST /api/dashboard/seo/audit]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
