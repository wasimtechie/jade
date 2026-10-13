import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { getPaymentGatewayMode } from "@/lib/payments/paymentGatewayMode";
import { isAxisRoomsConfigured, isAxisRoomsEnabled } from "@/lib/axisRooms/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function flag(name: string): "set" | "missing" {
  const v = process.env[name];
  return v && String(v).trim().length > 0 ? "set" : "missing";
}

/** Redacted runtime config — no secret values exposed. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/dev/system", "read");
  if (!auth.ok) return auth.response;

  let mongoOk = false;
  let mongoError: string | null = null;
  try {
    await connectDB();
    mongoOk = true;
  } catch (e) {
    mongoError = e instanceof Error ? e.message : "Connection failed";
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV ?? "development",
    nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    mongo: { ok: mongoOk, error: mongoError },
    secrets: {
      NEXTAUTH_SECRET: flag("NEXTAUTH_SECRET"),
      MONGODB_URI: flag("MONGODB_URI"),
      RAZORPAY_KEY_ID: flag("RAZORPAY_KEY_ID"),
      RAZORPAY_KEY_SECRET: flag("RAZORPAY_KEY_SECRET"),
      RAZORPAY_WEBHOOK_SECRET: flag("RAZORPAY_WEBHOOK_SECRET"),
      CRON_SECRET: flag("CRON_SECRET"),
      AXIS_ROOMS_API_KEY: flag("AXIS_ROOMS_API_KEY"),
      AXIS_ROOMS_CHANNEL_ID: flag("AXIS_ROOMS_CHANNEL_ID"),
      AXIS_ROOMS_API_BASE_URL: flag("AXIS_ROOMS_API_BASE_URL"),
      AXIS_ROOMS_WEBHOOK_SECRET: flag("AXIS_ROOMS_WEBHOOK_SECRET"),
    },
    axisRooms: {
      enabled: isAxisRoomsEnabled(),
      pmsName: process.env.AXIS_ROOMS_PMS_NAME?.trim() || "Jade Host PMS",
      baseUrl:
        process.env.AXIS_ROOMS_API_BASE_URL?.trim() ||
        "https://sandbox2.axisrooms.com",
      configured: isAxisRoomsConfigured(),
      inboundWebhookPath: "/api/webhooks/axisrooms",
    },
    features: {
      bookingsStoreFallback: process.env.BOOKINGS_STORE_FALLBACK === "true",
      paymentGatewayMode: getPaymentGatewayMode(),
    },
  });
}
