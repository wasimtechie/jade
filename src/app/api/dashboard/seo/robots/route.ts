import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { withMongo } from "@/lib/api/mongoRoute";
import { getSeoSiteSettings } from "@/lib/seo/seoSiteSettings";
import { SeoSiteSettingsModel } from "@/models/SeoSiteSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /book
Disallow: /book/
Disallow: /menu
Disallow: /api/
Disallow: /admin
Disallow: /admin/
Disallow: /wishlist
Disallow: /wishlist/
Disallow: /dashboard
Disallow: /login

Sitemap: https://jadehospitainment.com/sitemap.xml
Host: https://jadehospitainment.com`;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, "/dashboard/seo/manager", "read");
    if (!auth.ok) return auth.response;

    const result = await withMongo(async () => {
      const settings = await getSeoSiteSettings();
      const override = (settings as { robotsTxtOverride?: string | null })
        ?.robotsTxtOverride;
      return {
        content: override ?? DEFAULT_ROBOTS,
        isOverride: Boolean(override),
        defaultContent: DEFAULT_ROBOTS,
      };
    });

    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/dashboard/seo/robots] unhandled", e);
    const detail = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json(
      { error: "Failed to load robots.txt", code: "SEO_ROBOTS_ERROR", detail },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, "/dashboard/seo/manager", "write");
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as {
      content?: string | null;
      restoreDefault?: boolean;
    };
    const result = await withMongo(async () => {
      const update =
        body.restoreDefault === true
          ? { robotsTxtOverride: null }
          : { robotsTxtOverride: body.content ?? null };

      const doc = await SeoSiteSettingsModel.findOneAndUpdate(
        { key: "default" },
        { $set: update },
        { upsert: true, new: true },
      );

      return { settings: { robotsTxtOverride: doc?.robotsTxtOverride ?? null } };
    });

    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (e) {
    console.error("[PATCH /api/dashboard/seo/robots] unhandled", e);
    const detail = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json(
      { error: "Failed to save robots.txt", code: "SEO_ROBOTS_ERROR", detail },
      { status: 500 },
    );
  }
}
