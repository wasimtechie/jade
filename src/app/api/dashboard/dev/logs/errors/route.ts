import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { AuditLogModel } from "@/models/AuditLog";

export const dynamic = "force-dynamic";

/** Read-only named aggregation — error-related audit entries. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/dev/logs/errors", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const errors = await AuditLogModel.find({
      action: { $regex: /(failed|error|conflict)/i },
    })
      .sort({ createdAt: -1 })
      .limit(100);
    return NextResponse.json({ errors });
  } catch (e) {
    console.error("[GET /api/dashboard/dev/logs/errors]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
