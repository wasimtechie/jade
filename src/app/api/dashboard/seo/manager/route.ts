import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { withMongo } from "@/lib/api/mongoRoute";
import { toJsonSafe } from "@/lib/api/safeJson";
import { runSiteSeoAudit } from "@/lib/seo/siteHealth";
import { getSeoSiteSettings } from "@/lib/seo/seoSiteSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeSettings(doc: Record<string, unknown> | null | undefined) {
  if (!doc) {
    return {
      key: "default",
      robotsTxtOverride: null,
      sitemapLastGeneratedAt: null,
      sitemapUrlCount: 0,
    };
  }
  const lastGen = doc.sitemapLastGeneratedAt;
  return {
    key: String(doc.key ?? "default"),
    robotsTxtOverride:
      typeof doc.robotsTxtOverride === "string" ? doc.robotsTxtOverride : null,
    sitemapLastGeneratedAt:
      lastGen instanceof Date
        ? lastGen.toISOString()
        : typeof lastGen === "string"
          ? lastGen
          : null,
    sitemapUrlCount:
      typeof doc.sitemapUrlCount === "number" ? doc.sitemapUrlCount : 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, "/dashboard/seo/manager", "read");
    if (!auth.ok) return auth.response;

    const result = await withMongo(async () => {
      const [report, settings] = await Promise.all([
        runSiteSeoAudit(),
        getSeoSiteSettings(),
      ]);
      return {
        report: toJsonSafe(report),
        settings: serializeSettings(
          settings as Record<string, unknown> | null | undefined,
        ),
      };
    });

    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/dashboard/seo/manager] unhandled", e);
    const detail = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json(
      { error: "Failed to load SEO report", code: "SEO_MANAGER_ERROR", detail },
      { status: 500 },
    );
  }
}
