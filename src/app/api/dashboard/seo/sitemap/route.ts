import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { getMergedPublishedPosts } from "@/lib/cms/blogStore";
import { resolvePublicVillaList } from "@/lib/villas/resolvePublicVilla";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jadehospitainment.com";

/** Sitemap URL inventory for SEO dashboard. */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, "/dashboard/seo/sitemap", "read");
    if (!auth.ok) return auth.response;

    const staticPaths = [
      "/",
      "/retreats/",
      "/weddings",
      "/experiences",
      "/weekend-getaways",
      "/corporate-retreats",
      "/party-villas",
      "/book",
      "/blogs",
      "/about",
      "/contact",
      "/careers",
      "/privacy-policy",
      "/terms-conditions",
      "/refund-policy",
    ];

    const [villas, blogPosts] = await Promise.all([
      resolvePublicVillaList(),
      getMergedPublishedPosts(),
    ]);
    const urls = [
      ...staticPaths.map((path) => ({
        loc: `${BASE}${path === "/" ? "" : path}`,
        type: "static" as const,
        priority: path === "/" ? 1 : 0.8,
      })),
      ...villas.map((villa) => ({
        loc: `${BASE}/retreat/${villa.id}/`,
        type: "villa" as const,
        priority: 0.85,
      })),
      ...blogPosts.map((p) => ({
        loc: `${BASE}/${p.slug}/`,
        type: "blog" as const,
        priority: 0.7,
      })),
    ];

    return NextResponse.json({ urls, total: urls.length, base: BASE });
  } catch (e) {
    console.error("[GET /api/dashboard/seo/sitemap] unhandled", e);
    const detail = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json(
      { error: "Failed to load sitemap", code: "SITEMAP_ERROR", detail },
      { status: 500 },
    );
  }
}
