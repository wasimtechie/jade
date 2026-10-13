import { NextResponse } from "next/server";
import { connectDB, isMongoConfigured } from "@/lib/db";

export type MongoApiErrorBody = {
  error: string;
  code:
    | "MONGODB_NOT_CONFIGURED"
    | "MONGODB_CONNECTION_FAILED"
    | "HANDLER_ERROR";
  hint?: string;
  detail?: string;
};

export function mongoNotConfiguredResponse(): NextResponse<MongoApiErrorBody> {
  return NextResponse.json(
    {
      error: "Database not configured on this server",
      code: "MONGODB_NOT_CONFIGURED",
      hint:
        "Add MONGODB_URI in Vercel → Project Settings → Environment Variables (Production), then redeploy.",
    },
    { status: 503 },
  );
}

export function mongoConnectionFailedResponse(
  e: unknown,
): NextResponse<MongoApiErrorBody> {
  const detail = e instanceof Error ? e.message : "Connection failed";
  const safeDetail = detail
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://***@")
    .slice(0, 280);
  return NextResponse.json(
    {
      error: "Database connection failed",
      code: "MONGODB_CONNECTION_FAILED",
      hint:
        "Verify MONGODB_URI, Atlas database user password, and Network Access (0.0.0.0/0 or Vercel IPs).",
      detail: safeDetail,
    },
    { status: 503 },
  );
}

/** Ensure Mongo is configured and connected before running a dashboard handler. */
export async function withMongo<T>(
  handler: () => Promise<T>,
): Promise<T | NextResponse<MongoApiErrorBody>> {
  if (!isMongoConfigured()) {
    return mongoNotConfiguredResponse();
  }
  try {
    await connectDB();
  } catch (e) {
    console.error("[withMongo] connect failed", e);
    return mongoConnectionFailedResponse(e);
  }

  try {
    return await handler();
  } catch (e) {
    console.error("[withMongo] handler error", e);
    const detail = e instanceof Error ? e.message : "Handler failed";
    return NextResponse.json(
      {
        error: "Request failed",
        code: "HANDLER_ERROR",
        detail,
      },
      { status: 500 },
    );
  }
}
