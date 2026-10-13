import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { LeadModel } from "@/models/Lead";
import { PartnerLeadModel } from "@/models/PartnerLead";
import { leadSourceLabel } from "@/lib/leads/sourceLabels";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

function payloadName(payload: Record<string, unknown> | undefined): string {
  if (!payload) return "Guest";
  return String(payload.fullName ?? payload.name ?? "Guest").slice(0, 200);
}

function payloadPhone(payload: Record<string, unknown> | undefined): string | null {
  if (!payload) return null;
  const p = payload.phoneNumber ?? payload.phone;
  return typeof p === "string" && p.trim() ? p.trim() : null;
}

function serializeEnquiry(doc: {
  _id: unknown;
  source: string;
  email?: string;
  payload?: Record<string, unknown>;
  status?: string;
  staffNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const payload = (doc.payload ?? {}) as Record<string, unknown>;
  return {
    id: String(doc._id),
    kind: "enquiry" as const,
    source: doc.source,
    sourceLabel: leadSourceLabel(doc.source),
    email: doc.email ?? null,
    name: payloadName(payload),
    phone: payloadPhone(payload),
    status: doc.status ?? "new",
    staffNotes: doc.staffNotes ?? "",
    payload,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

function serializePartner(doc: {
  _id: unknown;
  email?: string;
  payload?: Record<string, unknown>;
  status?: string;
  staffNotes?: string;
  photos?: { filename?: string; size?: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const payload = (doc.payload ?? {}) as Record<string, unknown>;
  return {
    id: String(doc._id),
    kind: "partner" as const,
    source: "partner_enquiry",
    sourceLabel: "Partner / list your property",
    email: doc.email ?? null,
    name: payloadName(payload),
    phone: payloadPhone(payload),
    status: doc.status ?? "new",
    staffNotes: doc.staffNotes ?? "",
    payload,
    photoCount: doc.photos?.length ?? 0,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/leads", "read");
  if (!auth.ok) return auth.response;

  const kind = req.nextUrl.searchParams.get("kind") ?? "enquiry";
  const source = req.nextUrl.searchParams.get("source");
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50)),
  );

  try {
    await connectDB();

    if (kind === "partner") {
      const filter: Record<string, unknown> = { isDeleted: false };
      if (status) filter.status = status;
      const docs = await PartnerLeadModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      let rows = docs.map((d) => serializePartner(d as never));
      if (q) {
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.email?.toLowerCase().includes(q) ?? false) ||
            JSON.stringify(r.payload).toLowerCase().includes(q),
        );
      }
      return NextResponse.json({ leads: rows }, { headers: noStore });
    }

    const filter: Record<string, unknown> = { isDeleted: false };
    if (source) filter.source = source;
    if (status) filter.status = status;
    const docs = await LeadModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    let rows = docs.map((d) => serializeEnquiry(d as never));
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.email?.toLowerCase().includes(q) ?? false) ||
          r.sourceLabel.toLowerCase().includes(q) ||
          JSON.stringify(r.payload).toLowerCase().includes(q),
      );
    }
    return NextResponse.json({ leads: rows }, { headers: noStore });
  } catch (e) {
    console.error("[GET /api/dashboard/leads]", e);
    return NextResponse.json(
      { error: "Failed to load leads" },
      { status: 500, headers: noStore },
    );
  }
}

const patchSchema = z.object({
  kind: z.enum(["enquiry", "partner"]),
  leadId: z.string().min(1),
  status: z.enum(["new", "contacted", "closed"]).optional(),
  staffNotes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/leads", "write");
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const { kind, leadId, status, staffNotes } = parsed.data;

  try {
    await connectDB();
    const Model = kind === "partner" ? PartnerLeadModel : LeadModel;
    const doc = await Model.findOne({ _id: leadId, isDeleted: false });
    if (!doc) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404, headers: noStore },
      );
    }

    if (status !== undefined) doc.status = status;
    if (staffNotes !== undefined) doc.staffNotes = staffNotes;
    if (status !== undefined || staffNotes !== undefined) {
      doc.handledBy = auth.userId as never;
    }
    await doc.save();

    await auditLog({
      action: "lead.update",
      targetType: kind === "partner" ? "partner_lead" : "lead",
      targetId: leadId,
      userId: auth.userId,
      metadata: { status, staffNotes: staffNotes !== undefined },
    });

    return NextResponse.json(
      {
        ok: true,
        lead:
          kind === "partner"
            ? serializePartner(doc as never)
            : serializeEnquiry(doc as never),
      },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[PATCH /api/dashboard/leads]", e);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500, headers: noStore },
    );
  }
}
