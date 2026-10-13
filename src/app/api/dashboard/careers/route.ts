import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { CareerModel } from "@/models/Career";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

const CAREER_STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

function serializeCareer(doc: {
  _id: unknown;
  jobId?: string;
  jobTitle?: string;
  sourcePage?: string;
  applyContext?: string;
  clientPath?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  resume?: { filename?: string; mime?: string; size?: number; gridFsId?: string };
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    jobId: doc.jobId ?? "",
    jobTitle: doc.jobTitle ?? doc.jobId ?? "Role",
    sourcePage: doc.sourcePage ?? null,
    applyContext: doc.applyContext ?? null,
    clientPath: doc.clientPath ?? null,
    fullName: doc.fullName ?? "Applicant",
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    company: doc.company ?? null,
    status: doc.status ?? "new",
    statusLabel: CAREER_STATUS_LABELS[doc.status ?? "new"] ?? doc.status,
    resumeFilename: doc.resume?.filename ?? null,
    resumeMime: doc.resume?.mime ?? null,
    resumeSize: doc.resume?.size ?? 0,
    hasResume: Boolean(doc.resume?.gridFsId),
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/careers", "read");
  if (!auth.ok) return auth.response;

  const jobId = req.nextUrl.searchParams.get("jobId");
  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50)),
  );

  try {
    await connectDB();
    const filter: Record<string, unknown> = { isDeleted: false };
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    const docs = await CareerModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    let rows = docs.map((d) => serializeCareer(d as never));
    if (q) {
      rows = rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.email?.toLowerCase().includes(q) ?? false) ||
          r.jobTitle.toLowerCase().includes(q) ||
          r.jobId.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({ applications: rows }, { headers: noStore });
  } catch (e) {
    console.error("[GET /api/dashboard/careers]", e);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500, headers: noStore },
    );
  }
}

const patchSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["new", "reviewing", "shortlisted", "rejected", "hired"]),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/careers", "write");
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

  const { applicationId, status } = parsed.data;

  try {
    await connectDB();
    const doc = await CareerModel.findOne({
      _id: applicationId,
      isDeleted: false,
    });
    if (!doc) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404, headers: noStore },
      );
    }

    doc.status = status;
    await doc.save();

    await auditLog({
      action: "career.update",
      targetType: "career",
      targetId: applicationId,
      userId: auth.userId,
      metadata: { status },
    });

    return NextResponse.json(
      { ok: true, application: serializeCareer(doc as never) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[PATCH /api/dashboard/careers]", e);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500, headers: noStore },
    );
  }
}
