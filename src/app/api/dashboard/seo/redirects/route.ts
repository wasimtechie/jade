import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import {
  createRedirect,
  listRedirects,
} from "@/lib/seo/redirectService";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/redirects", "read");
  if (!auth.ok) return auth.response;

  try {
    const redirects = await listRedirects();
    return NextResponse.json({ redirects });
  } catch (e) {
    console.error("[GET /api/dashboard/seo/redirects]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

const createSchema = z.object({
  fromPath: z.string().min(1).max(500),
  toPath: z.string().min(1).max(500),
  type: z.enum(["301", "302"]).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/redirects", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const redirect = await createRedirect({
      ...parsed.data,
      userId: auth.userId,
    });
    return NextResponse.json({ redirect }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
