import { NextRequest, NextResponse } from "next/server";
import { resolveRedirectPath } from "@/lib/seo/redirectService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public redirect resolver for middleware (no auth). */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  try {
    const hit = await resolveRedirectPath(path);
    return NextResponse.json(
      { redirect: hit },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json({ redirect: null }, { status: 500 });
  }
}
