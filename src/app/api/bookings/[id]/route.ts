import { NextRequest, NextResponse } from "next/server";
import { getBookingStore } from "@/lib/bookings/mongoStore";
import type { StayStatus } from "@/lib/bookings/types";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { requireRole } from "@/lib/auth/requireRole";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";
import { isBookingRef } from "@/lib/bookings/ids";
import { auditLog } from "@/lib/audit/auditLog";

export const dynamic = "force-dynamic";

async function requireBookingAccess(req: NextRequest, min: "read" | "write") {
  return requireRole(req, "/dashboard/bookings", min);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireBookingAccess(req, "read");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  try {
    const store = getBookingStore();
    const booking = await store.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ booking }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[GET /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Stay-status is a housekeeping action (team can write, scoped to assigned
  // villas); other booking edits are not yet handled by this route.
  const auth = await requireRole(req, "/dashboard/housekeeping", "write");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req, 8192);
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const b = body as Record<string, unknown>;
  const store = getBookingStore();

  if (typeof b.stayStatus === "string") {
    const allowed: StayStatus[] = [
      "upcoming",
      "in_house",
      "departed",
      "turnover",
      "ready",
    ];
    if (!allowed.includes(b.stayStatus as StayStatus)) {
      return NextResponse.json({ error: "Invalid stayStatus" }, { status: 400 });
    }

    const booking = await store.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Server-side villa scoping: team members may only touch assigned villas.
    if (auth.role === "team" && !auth.assignedVillas.includes(booking.villaId)) {
      return NextResponse.json(
        { error: "Forbidden: villa not assigned to you" },
        { status: 403 },
      );
    }

    const updated = await store.updateStayStatus(
      params.id,
      b.stayStatus as StayStatus,
    );
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await auditLog({
      action: "booking.update",
      targetType: "booking",
      targetId: params.id,
      userId: auth.userId,
      metadata: { stayStatus: b.stayStatus, villaId: booking.villaId },
    });

    return NextResponse.json({ success: true, booking: updated });
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireBookingAccess(req, "write");
  if (!auth.ok) return auth.response;

  if (!isBookingRef(params.id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const ip = req.ip ?? getClientIpFromHeaders(req.headers);
  rateLimit({ key: `bookings:delete:${ip}`, limit: 30, windowMs: 600000 });

  try {
    const store = getBookingStore();
    const ok = await store.softDelete(params.id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
