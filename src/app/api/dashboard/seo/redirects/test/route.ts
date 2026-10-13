import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { testRedirect } from "@/lib/seo/redirectService";
import { SeoRedirectModel } from "@/models/SeoRedirect";
import { connectDB } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  fromPath: z.string().min(1),
  toPath: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo/redirects", "read");
  if (!auth.ok) return auth.response;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const all = await SeoRedirectModel.find({ status: "active" })
      .select("fromPath toPath")
      .lean();

    const result = testRedirect(
      parsed.data.fromPath,
      parsed.data.toPath,
      all as { fromPath: string; toPath: string }[],
    );

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
