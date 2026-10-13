import { NextRequest, NextResponse } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { notifyNewLead } from "@/lib/email/leadsNotifications";
import { validateAndPreviewLead } from "@/lib/leads/buildLeadPreview";

export const dynamic = "force-dynamic";

const MAX_JSON = 56 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = rateLimit({
      key: `leads:post:${ip}`,
      limit: 20,
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

    let body: unknown;
    try {
      body = await readJsonBody(req, MAX_JSON);
    } catch (e) {
      if (e instanceof SafeJsonError) {
        return NextResponse.json(
          { error: e.message },
          { status: e.status, headers: { "Cache-Control": "no-store" } },
        );
      }
      throw e;
    }

    if (body === null || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid body" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const b = body as Record<string, unknown>;
    const parsed = validateAndPreviewLead(b);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { connectDB } = await import("@/lib/db");
    const { LeadModel } = await import("@/models/Lead");
    const { auditLog } = await import("@/lib/audit/auditLog");

    await connectDB();
    const doc = await LeadModel.create({
      source: b.source,
      payload: b.payload ?? {},
      email: parsed.email,
    });

    await auditLog({
      action: "lead.create",
      targetType: "lead",
      targetId: String(doc._id),
      ip,
    });

    const id = String(doc._id);
    await notifyNewLead({
      source: String(b.source),
      preview: `${parsed.preview}\n\nLead row id: ${id}`,
      replyToEmail: parsed.email,
    });

    return NextResponse.json(
      { ok: true, leadId: id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/leads]", err);
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
          "Unable to save your enquiry. Please try again or contact us directly.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
