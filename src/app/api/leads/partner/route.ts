import { NextRequest, NextResponse } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { notifyPartnerLead } from "@/lib/email/partnerNotifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_META_CHARS = 64_000;
const MAX_FILES = 6;
/** Per-photo cap (~4.5 MB each; total capped in loop). */
const MAX_PHOTO_BYTES = 4_500_000;
const MAX_PAYLOAD_BYTES_TOTAL = 20_000_000;

function normalizeEmail(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const v = s.trim().toLowerCase();
  if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = rateLimit({
      key: `leads:partner:${ip}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rl.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const formData = await req.formData();

    const metaRaw = formData.get("meta");
    if (typeof metaRaw !== "string" || metaRaw.length > MAX_META_CHARS) {
      return NextResponse.json(
        { error: "Invalid meta payload" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    let meta: unknown;
    try {
      meta = JSON.parse(metaRaw);
    } catch {
      return NextResponse.json(
        { error: "meta must be JSON" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (typeof meta !== "object" || meta === null) {
      return NextResponse.json(
        { error: "Invalid meta structure" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const o = meta as Record<string, unknown>;
    const email = normalizeEmail(o.email);
    const fullName = String(o.fullName ?? "").trim();
    if (!email || fullName.length < 2) {
      return NextResponse.json(
        { error: "Name and valid email required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const hasPartnershipInterest = (
      pairs: Record<string, boolean> | undefined,
    ): boolean =>
      !!pairs &&
      Object.values(pairs).some(Boolean);

    const partnershipOther = String(o.partnershipOther ?? "").trim();
    if (
      !hasPartnershipInterest(
        o.partnershipType as Record<string, boolean> | undefined,
      ) &&
      !partnershipOther
    ) {
      return NextResponse.json(
        { error: "Select at least one partnership interest" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const propertyType = o.propertyType as Record<string, boolean> | undefined;
    const propertyOther = String(o.propertyOther ?? "").trim();
    if (!hasPartnershipInterest(propertyType) && !propertyOther) {
      return NextResponse.json(
        { error: "Select at least one property type" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const details = o.propertyDetails as Record<string, unknown> | undefined;
    const location = String(details?.location ?? "").trim();
    const bedrooms = String(details?.bedrooms ?? "").trim();
    const eventCapacity = String(details?.eventCapacity ?? "").trim();
    if (!location || !bedrooms || !eventCapacity) {
      return NextResponse.json(
        { error: "Property location, bedrooms, and event capacity are required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    let totalBytes = 0;
    const files: File[] = [];
    for (const entry of formData.getAll("photos")) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      if (files.length >= MAX_FILES) break;
      if (entry.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          {
            error: `Each photo must be smaller than ${Math.floor(MAX_PHOTO_BYTES / (1024 * 1024))} MB`,
          },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }
      totalBytes += entry.size;
      if (totalBytes > MAX_PAYLOAD_BYTES_TOTAL) {
        return NextResponse.json(
          { error: "Total upload size is too large" },
          {
            status: 400,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
      files.push(entry);
    }

    if (files.length < 1) {
      return NextResponse.json(
        { error: "Upload at least one property image" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { connectDB } = await import("@/lib/db");
    const { PartnerLeadModel } = await import("@/models/PartnerLead");
    const { deleteFromGridFS, uploadToGridFS } = await import("@/lib/storage/gridfs");
    const { auditLog } = await import("@/lib/audit/auditLog");

    await connectDB();

    const photos: Array<{
      ordinal: number;
      filename: string;
      mime: string;
      size: number;
      gridFsId: string;
    }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]!;
        const buf = Buffer.from(await f.arrayBuffer());
        const mime = f.type.slice(0, 120) || "application/octet-stream";
        const { gridFsId, size } = await uploadToGridFS({
          filename: f.name.slice(0, 260),
          mime,
          buffer: buf,
          bucketName: "partner_photos",
        });
        photos.push({
          ordinal: i,
          filename: f.name.slice(0, 260),
          mime,
          size,
          gridFsId,
        });
      }

      const doc = await PartnerLeadModel.create({
        email,
        payload: meta,
        photos,
      });

      const leadId = String(doc._id);

      await auditLog({
        action: "partner.create",
        targetType: "partner_lead",
        targetId: leadId,
        ip,
      });

      const detailsText = [
        `Partnership selections: ${JSON.stringify(o.partnershipType ?? {})}`,
        `Property types: ${JSON.stringify(o.propertyType ?? {})}`,
        `Details: ${JSON.stringify(o.propertyDetails ?? {})}`,
      ].join("\n");

      await notifyPartnerLead({
        partnerLeadId: leadId,
        name: fullName,
        email,
        phone: String(o.phoneNumber ?? "").slice(0, 40),
        company: String(o.company ?? "").slice(0, 200),
        details: detailsText,
        photos: photos.map((p) => ({
          gridFsId: p.gridFsId,
          filename: p.filename,
        })),
      });

      return NextResponse.json(
        { ok: true, partnerLeadId: leadId, photosSaved: files.length },
        {
          status: 201,
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      await Promise.all(
        photos.map((photo) =>
          deleteFromGridFS(photo.gridFsId, "partner_photos").catch(() => undefined),
        ),
      );
      throw error;
    }
  } catch (err) {
    console.error("[POST /api/leads/partner]", err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";
    const devDbHint =
      process.env.NODE_ENV !== "production" && code === "ECONNREFUSED"
        ? "Database is not running. Set MONGODB_URI in .env.local — see DEPLOYMENT.md."
        : null;
    return NextResponse.json(
      {
        error:
          devDbHint ??
          "Unable to save your submission. Try again or email us directly.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
