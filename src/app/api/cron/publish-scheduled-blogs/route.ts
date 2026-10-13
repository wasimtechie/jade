import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledBlogs } from "@/lib/cms/blogAdmin";

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
    const published = await publishDueScheduledBlogs();
    return NextResponse.json({ ok: true, published });
  } catch (e) {
    console.error("[cron/publish-scheduled-blogs]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
