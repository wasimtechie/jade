import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COLLECTIONS = [
  "bookings",
  "villas",
  "users",
  "leads",
  "careers",
  "partnerleads",
  "villablocks",
  "villanightlocks",
  "webhookevents",
  "auditlogs",
  "contentpages",
  "ratelimitbuckets",
] as const;

/** Read-only MongoDB collection stats. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/dev/database", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "No database connection" }, { status: 503 });
    }

    const stats: { name: string; count: number }[] = [];
    const existing = new Set(
      (await db.listCollections().toArray()).map((c) => c.name.toLowerCase()),
    );

    for (const name of COLLECTIONS) {
      if (!existing.has(name)) {
        stats.push({ name, count: 0 });
        continue;
      }
      const count = await db.collection(name).countDocuments();
      stats.push({ name, count });
    }

    const sampleCollection = req.nextUrl.searchParams.get("collection")?.trim();
    const sampleLimit = Math.min(
      Number(req.nextUrl.searchParams.get("sample") ?? 5),
      10,
    );
    let samples: { collection: string; documents: unknown[] } | null = null;
    if (
      sampleCollection &&
      existing.has(sampleCollection.toLowerCase()) &&
      COLLECTIONS.includes(sampleCollection.toLowerCase() as (typeof COLLECTIONS)[number])
    ) {
      const docs = await db
        .collection(sampleCollection)
        .find({})
        .sort({ _id: -1 })
        .limit(sampleLimit)
        .project({ passwordHash: 0 })
        .toArray();
      samples = { collection: sampleCollection, documents: docs };
    }

    return NextResponse.json({
      database: db.databaseName,
      collections: stats,
      host: mongoose.connection.host ?? null,
      samples,
    });
  } catch (e) {
    console.error("[GET /api/dashboard/dev/database]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
