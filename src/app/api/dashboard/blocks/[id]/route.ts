import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { syncBlockInventory } from "@/lib/axisRooms/sync";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { VillaBlockModel } from "@/models/VillaBlock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** Soft-delete a manual villa block. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/blocks", "write");
  if (!auth.ok) return auth.response;

  if (!OBJECT_ID.test(params.id)) {
    return NextResponse.json(
      { error: "Invalid block id" },
      { status: 400, headers: noStore },
    );
  }

  try {
    await connectDB();
    const block = await VillaBlockModel.findOne({
      _id: params.id,
      isDeleted: false,
    });
    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404, headers: noStore },
      );
    }

    block.isDeleted = true;
    block.deletedAt = new Date();
    block.deletedBy = auth.userId as never;
    await block.save();

    const axisSync = await syncBlockInventory(block, 1);

    await auditLog({
      action: "block.delete",
      targetType: "villa_block",
      targetId: params.id,
      userId: auth.userId,
      metadata: {
        villaId: String(block.villaId),
        checkIn: block.checkIn,
        checkOut: block.checkOut,
      },
    });

    return NextResponse.json({ ok: true, axisSync }, { headers: noStore });
  } catch (e) {
    console.error("[DELETE /api/dashboard/blocks/[id]]", e);
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500, headers: noStore },
    );
  }
}
