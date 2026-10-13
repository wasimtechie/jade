import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import { isBookingRef } from "@/lib/bookings/ids";
import { requireRole } from "@/lib/auth/requireRole";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { assertPlainObject, isoDateSchema } from "@/lib/security/validateInput";
import { z } from "zod";

export const dynamic = "force-dynamic";

const previewSchema = z.object({
  checkIn: isoDateSchema,
  checkOut: isoDateSchema,
});

function mapModifyError(e: unknown): { status: number; error: string } {
  if (!(e instanceof Error)) return { status: 500, error: "Preview failed" };
  switch (e.message) {
    case "DATE_CONFLICT":
      return { status: 409, error: "Selected dates conflict with another booking" };
    case "BLOCK_CONFLICT":
      return { status: 409, error: "Selected dates conflict with a calendar block" };
    case "LOCK_CONFLICT":
      return { status: 409, error: "Selected dates are no longer available" };
    case "INVALID_DATES":
      return { status: 422, error: "Check-out must be after check-in" };
    default:
      return { status: 400, error: e.message };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/bookings", "write");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req, 8 * 1024);
    assertPlainObject(body);
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const store = getBookingStore();

  try {
    const preview = await store.previewModifyBookingDates(params.id, parsed.data);
    if (!preview) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!preview.available) {
      return NextResponse.json(
        {
          ...preview,
          error: "Selected dates are no longer available",
          conflictingDate: preview.conflictingDate,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(preview, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const mapped = mapModifyError(e);
    console.error("[POST /api/dashboard/bookings/[id]/modify-preview]", e);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
