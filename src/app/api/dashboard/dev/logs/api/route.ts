import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { AuditLogModel } from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Recent audit trail — API / ops activity. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/dev/logs/api", "read");
  if (!auth.ok) return auth.response;

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 100),
    200,
  );

  try {
    await connectDB();
    const logs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({
      logs: logs.map((l) => ({
        id: String(l._id),
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId ?? null,
        userId: l.userId ? String(l.userId) : null,
        metadata: l.metadata ?? {},
        createdAt: l.createdAt ?? null,
      })),
    });
  } catch (e) {
    console.error("[GET /api/dashboard/dev/logs/api]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
