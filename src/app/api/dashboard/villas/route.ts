import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { VillaModel } from "@/models/Villa";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";
import { createVillaSchema } from "@/lib/villas/adminVilla";
import { revalidateVillaPublicPaths } from "@/lib/villas/revalidateVillaPaths";
import { villaHideFromDirectoryFlag } from "@/lib/villas/villaVisibility";
import { assessVillaDeletion } from "@/lib/villas/villaDeletion";
import { assertPlainObject } from "@/lib/security/validateInput";
import { deriveChannelState } from "@/lib/axisRooms/channelState";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

function serializeListVilla(v: {
  _id: unknown;
  slug: string;
  retreatId?: string;
  name: string;
  shortName?: string;
  type?: string;
  location?: string;
  thumbnail?: string;
  status?: string;
  bookable?: boolean;
  weddingVenue?: boolean;
  portfolioSource?: string;
  basePricePaise?: number;
  dayOutBasePricePaise?: number;
  stayBasePax?: number;
  dayOutBasePax?: number;
  stayMaxPax?: number;
  displayStats?: {
    stay?: string;
    events?: string;
    bhk?: string;
    lawn?: string;
    villaArea?: string;
    pool?: string;
  };
  channelMode?: string;
  axisRooms?: {
    propertyId?: string;
    roomTypeId?: string;
    ratePlanId?: string;
  };
  content?: Record<string, unknown>;
}) {
  const stats = v.displayStats ?? {};
  const hideFromVillasDirectory = villaHideFromDirectoryFlag(v);
  const deletion = assessVillaDeletion({
    slug: v.slug,
    retreatId: v.retreatId,
    portfolioSource: v.portfolioSource,
  });
  return {
    id: String(v._id),
    slug: v.slug,
    name: v.name,
    shortName: v.shortName ?? v.name,
    type: v.type ?? null,
    location: v.location ?? null,
    thumbnail: v.thumbnail ?? null,
    status: v.status ?? "active",
    bookable: v.bookable ?? true,
    weddingVenue: v.weddingVenue ?? false,
    portfolioSource: v.portfolioSource ?? "canonical",
    hideFromVillasDirectory,
    deletable: deletion.allowed,
    deleteBlockedReason: deletion.reason ?? null,
    directoryListingVisible:
      v.status !== "hidden" && !hideFromVillasDirectory,
    basePriceRupees: paiseToRupees(v.basePricePaise ?? 0),
    dayOutBasePriceRupees: paiseToRupees(v.dayOutBasePricePaise ?? 0),
    stayBasePax: v.stayBasePax ?? 0,
    dayOutBasePax: v.dayOutBasePax ?? 0,
    stayMaxPax: v.stayMaxPax ?? 0,
    displayStats: {
      stay: stats.stay ?? null,
      events: stats.events ?? null,
      bhk: stats.bhk ?? null,
      lawn: stats.lawn ?? null,
      villaArea: stats.villaArea ?? null,
      pool: stats.pool ?? null,
    },
    channelMode: v.channelMode ?? "website_only",
    channelState: deriveChannelState(v),
  };
}

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const auth = await requireRole(
    req,
    all ? "/dashboard/settings/villas" : "/dashboard",
    "read",
  );
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const query: Record<string, unknown> = { isDeleted: false };
    if (!all) {
      query.bookable = true;
      query.status = { $ne: "hidden" };
    }

    const docs = await VillaModel.find(query).sort({ name: 1 }).lean();

    return NextResponse.json(
      { villas: docs.map((v) => serializeListVilla(v as never)) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/villas]", e);
    return NextResponse.json(
      { error: "Failed to load villas" },
      { status: 500, headers: noStore },
    );
  }
}

/** Create a new property (starts hidden until published). */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/settings/villas", "write");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
    assertPlainObject(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: noStore },
    );
  }

  const parsed = createVillaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const input = parsed.data;
  const retreatId = input.retreatId ?? input.slug;

  try {
    await connectDB();
    const exists = await VillaModel.findOne({
      $or: [{ slug: input.slug }, { retreatId }],
      isDeleted: false,
    });
    if (exists) {
      return NextResponse.json(
        { error: "Slug or retreat ID already exists" },
        { status: 409, headers: noStore },
      );
    }

    const doc = await VillaModel.create({
      slug: input.slug,
      retreatId,
      name: input.name,
      shortName: input.shortName,
      type: input.type,
      location: input.location,
      thumbnail: input.thumbnail,
      basePricePaise: rupeesToPaise(input.basePriceRupees),
      dayOutBasePricePaise: rupeesToPaise(input.dayOutBasePriceRupees),
      stayBasePax: input.stayBasePax,
      dayOutBasePax: input.dayOutBasePax,
      stayMaxPax: input.stayMaxPax,
      weddingVenue: false,
      weddingTiers: [],
      addOnAvailability: [],
      portfolioSource: "custom",
      channelMode: "website_only",
      settings: {
        taxPercent: 18,
        cleaningFeePaise: 0,
        securityDepositPaise: 0,
        cancellationPolicy: "",
        checkInTime: "14:00",
        checkOutTime: "11:00",
      },
      status: input.status,
      bookable: input.bookable,
      content: input.content ?? {},
    });

    const { syncVillaVisibilityFlags } = await import(
      "@/lib/villas/villaVisibility"
    );
    syncVillaVisibilityFlags(doc);
    await doc.save();

    await auditLog({
      action: "villa.create",
      targetType: "villa",
      targetId: String(doc._id),
      userId: auth.userId,
      metadata: { slug: input.slug, retreatId },
    });

    revalidateVillaPublicPaths({ slug: input.slug, retreatId });

    return NextResponse.json(
      { slug: input.slug, retreatId, id: String(doc._id) },
      { status: 201, headers: noStore },
    );
  } catch (e) {
    console.error("[POST /api/dashboard/villas]", e);
    return NextResponse.json(
      { error: "Failed to create villa" },
      { status: 500, headers: noStore },
    );
  }
}
