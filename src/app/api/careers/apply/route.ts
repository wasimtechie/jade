import { NextRequest, NextResponse } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { notifyCareerApplication } from "@/lib/email/careerNotifications";
import { resolveCareerJobTitle } from "@/data/careersJobs";
import {
  isAllowedResumeMime,
  MAX_RESUME_BYTES,
} from "@/lib/careerResumeValidation";

export const dynamic = "force-dynamic";

/**
 * POST /api/careers/apply — multipart form application.
 *
 * Indexing fields (MongoDB Career model):
 * - job_id / job_title — role slug + display title for HR filters
 * - source_page — site section (e.g. /careers)
 * - apply_context — careers:role:{jobId} | careers:open-application
 * - client_path — pathname when user opened Apply overlay
 *
 * Résumé is required (resume_bytes NOT NULL on new installs).
 */
function normalizeEmail(s: string): string | null {
  const v = s.trim().toLowerCase();
  if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  return v;
}

function clip(s: string, max: number): string {
  return s.trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? getClientIpFromHeaders(req.headers);
    const rl = rateLimit({
      key: `careers:apply:${ip}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many applications from this connection. Try later.",
        }),
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

    const jobId = clip(String(formData.get("jobId") ?? ""), 120);
    const jobTitle =
      clip(String(formData.get("jobTitle") ?? ""), 200) ||
      resolveCareerJobTitle(jobId);
    const sourcePage = clip(String(formData.get("sourcePage") ?? "/careers"), 120);
    const applyContext = clip(String(formData.get("applyContext") ?? ""), 160);
    const clientPath = clip(String(formData.get("clientPath") ?? ""), 500);
    const fullName = clip(String(formData.get("fullName") ?? ""), 200);
    const email = normalizeEmail(String(formData.get("email") ?? ""));
    const phone = clip(String(formData.get("phone") ?? ""), 40);
    const company = clip(String(formData.get("company") ?? ""), 200);

    if (!jobId || !fullName || !email) {
      return NextResponse.json(
        { error: "jobId, fullName, and a valid email are required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const resume = formData.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json(
        { error: "Résumé is required. Upload a PDF or image under 4 MB." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        {
          error: `Résumé must be smaller than ${MAX_RESUME_BYTES / (1024 * 1024)} MB`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!isAllowedResumeMime(resume.type, resume.name)) {
      return NextResponse.json(
        {
          error:
            "Résumé must be a PDF or image (JPEG, PNG, WebP, HEIC) under 4 MB.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const ab = await resume.arrayBuffer();
    const resumeBuf = Buffer.from(ab);
    const resumeFilename = resume.name.slice(0, 260);
    const resumeMime = resume.type.slice(0, 120) || "application/octet-stream";

    const resolvedContext =
      applyContext ||
      (jobId === "open-application"
        ? "careers:open-application"
        : `careers:role:${jobId}`);

    const { connectDB } = await import("@/lib/db");
    const { CareerModel } = await import("@/models/Career");
    const { deleteFromGridFS, uploadToGridFS } = await import("@/lib/storage/gridfs");
    const { auditLog } = await import("@/lib/audit/auditLog");

    await connectDB();
    const { gridFsId, size } = await uploadToGridFS({
      filename: resumeFilename,
      mime: resumeMime,
      buffer: resumeBuf,
      bucketName: "resumes",
    });

    let rowId: string | null = null;
    try {
      const doc = await CareerModel.create({
        jobId,
        jobTitle,
        sourcePage: sourcePage || "/careers",
        applyContext: resolvedContext,
        clientPath,
        fullName,
        email,
        phone,
        company,
        resume: {
          filename: resumeFilename,
          mime: resumeMime,
          size,
          gridFsId,
        },
      });

      await auditLog({
        action: "career.apply",
        targetType: "career",
        targetId: String(doc._id),
        ip,
      });

      rowId = String(doc._id);
      if (!rowId) {
        return NextResponse.json(
          { error: "Unable to save application" },
          { status: 500, headers: { "Cache-Control": "no-store" } },
        );
      }

      await notifyCareerApplication({
        jobId,
        jobTitle,
        applyContext: resolvedContext,
        sourcePage: sourcePage || "/careers",
        applicantName: fullName,
        applicantEmail: email,
        applicationId: rowId,
        phone,
        company,
        resumeGridFsId: gridFsId,
        resumeFilename,
      });
    } catch (error) {
      await deleteFromGridFS(gridFsId, "resumes").catch(() => undefined);
      throw error;
    }

    if (!rowId) {
      return NextResponse.json(
        { error: "Unable to save application" },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { ok: true, applicationId: rowId },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/careers/apply]", err);
    return NextResponse.json(
      { error: "Unable to submit application. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

