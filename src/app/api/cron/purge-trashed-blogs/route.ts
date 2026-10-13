import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredTrashedBlogs } from "@/lib/cms/blogAdmin";

export const dynamic = "force-dynamic";

function verifyCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const purged = await purgeExpiredTrashedBlogs();
    return NextResponse.json({ ok: true, purged });
  } catch (e) {
    console.error("[cron/purge-trashed-blogs]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
