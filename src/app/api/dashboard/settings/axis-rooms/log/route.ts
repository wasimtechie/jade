import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { AuditLogModel } from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

/** Recent Axis Rooms sync audit entries (inventory, price, inbound, channel). */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/axis-rooms", "read");
  if (!auth.ok) return auth.response;

  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50)),
  );

  try {
    await connectDB();
    const docs = await AuditLogModel.find({
      action: { $regex: /^axisrooms\./ },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const entries = docs.map((d) => ({
      id: String(d._id),
      action: d.action,
      targetType: d.targetType,
      targetId: d.targetId ?? null,
      metadata: d.metadata ?? {},
      createdAt:
        (d as { createdAt?: Date }).createdAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ entries }, { headers: noStore });
  } catch (e) {
    console.error("[GET /api/dashboard/settings/axis-rooms/log]", e);
    return NextResponse.json(
      { error: "Failed to load sync log" },
      { status: 500, headers: noStore },
    );
  }
}
