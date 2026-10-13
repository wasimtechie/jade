import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { deleteRedirect, updateRedirect } from "@/lib/seo/redirectService";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };

const patchSchema = z.object({
  toPath: z.string().max(500).optional(),
  type: z.enum(["301", "302"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  note: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo/redirects", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const redirect = await updateRedirect(ctx.params.id, parsed.data, auth.userId);
    if (!redirect) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ redirect });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(_req, "/dashboard/seo/redirects", "write");
  if (!auth.ok) return auth.response;

  await deleteRedirect(ctx.params.id);
  return NextResponse.json({ ok: true });
}
