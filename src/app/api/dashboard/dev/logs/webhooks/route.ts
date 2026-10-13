import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { WebhookEventModel } from "@/models/WebhookEvent";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/dev/logs/webhooks", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const eventId = req.nextUrl.searchParams.get("eventId")?.trim();
    if (eventId) {
      const event = await WebhookEventModel.findOne({ eventId }).lean();
      if (!event) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ event });
    }

    const events = await WebhookEventModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select("eventId source status createdAt bookingId paymentId orderId error payload")
      .lean();
    const summarized = events.map((e) => ({
      ...e,
      payloadPreview:
        e.payload != null
          ? JSON.stringify(e.payload).slice(0, 160)
          : null,
      payload: undefined,
    }));
    return NextResponse.json({ events: summarized });
  } catch (e) {
    console.error("[GET /api/dashboard/dev/logs/webhooks]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
