import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { acquireEditLock, releaseEditLock } from "@/lib/cms/blogAdmin";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { pageKey: string } };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  const pageKey = decodeURIComponent(ctx.params.pageKey);
  try {
    const body = (await req.json()) as {
      action?: "acquire" | "release";
      userName?: string;
      force?: boolean;
    };

    if (body.action === "release") {
      await releaseEditLock(pageKey, auth.userId);
      return NextResponse.json({ ok: true });
    }

    const result = await acquireEditLock(
      pageKey,
      auth.userId,
      body.userName ?? "Editor",
      body.force === true,
    );
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
