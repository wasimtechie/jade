import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { syncBlockInventory } from "@/lib/axisRooms/sync";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { VillaBlockModel } from "@/models/VillaBlock";
import { VillaModel } from "@/models/Villa";
import { isoDateSchema } from "@/lib/security/validateInput";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

const blockSchema = z
  .object({
    villaSlug: z.string().min(1),
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.checkIn < d.checkOut, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

function serializeBlock(
  doc: {
    _id: unknown;
    villaId: unknown;
    checkIn: string;
    checkOut: string;
    reason?: string;
    createdAt?: Date;
  },
  villa?: { _id?: unknown; slug?: string; name?: string } | null,
) {
  const v = villa;
  return {
    id: String(doc._id),
    villaId: String(v?._id ?? doc.villaId),
    villaSlug: v?.slug ?? "",
    villaName: v?.name ?? "",
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    reason: doc.reason ?? "",
    createdAt: doc.createdAt ?? null,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/blocks", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const blocks = await VillaBlockModel.find({ isDeleted: false })
      .populate("villaId", "slug name")
      .sort({ checkIn: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(
      {
        blocks: blocks.map((b) =>
          serializeBlock(
            b as never,
            b.villaId as { slug?: string; name?: string } | null,
          ),
        ),
      },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/blocks]", e);
    return NextResponse.json(
      { error: "Failed" },
      { status: 500, headers: noStore },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/blocks", "write");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = blockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const villa = await VillaModel.findOne({
      slug: parsed.data.villaSlug,
      isDeleted: false,
    });
    if (!villa) {
      return NextResponse.json({ error: "Villa not found" }, { status: 404 });
    }

    const block = await VillaBlockModel.create({
      villaId: villa._id,
      checkIn: parsed.data.checkIn,
      checkOut: parsed.data.checkOut,
      reason: parsed.data.reason,
      createdBy: auth.userId,
    });

    await auditLog({
      action: "block.create",
      targetType: "villa_block",
      targetId: String(block._id),
      userId: auth.userId,
      metadata: {
        villaSlug: villa.slug,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
      },
    });

    const axisSync = await syncBlockInventory(block, 0);

    return NextResponse.json(
      {
        block: serializeBlock(block as never, {
          _id: villa._id,
          slug: villa.slug,
          name: villa.name,
        }),
        axisSync,
      },
      { status: 201, headers: noStore },
    );
  } catch (e) {
    console.error("[POST /api/dashboard/blocks]", e);
    return NextResponse.json(
      { error: "Failed" },
      { status: 500, headers: noStore },
    );
  }
}
