import { connectDB } from "@/lib/db";
import { RateLimitBucketModel } from "@/models/RateLimitBucket";

type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number; remaining: 0 };

export async function persistentRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): Promise<RateLimitResult> {
  const now = params.now ?? Date.now();
  const nowDate = new Date(now);
  const resetAt = new Date(now + params.windowMs);

  try {
    await connectDB();
  } catch {
    // Fallback: allow if Mongo unavailable (degraded)
    return { ok: true, remaining: params.limit };
  }

  // Active window, under limit — atomic increment (avoids stale doc save races)
  const incremented = await RateLimitBucketModel.findOneAndUpdate(
    {
      key: params.key,
      resetAt: { $gt: nowDate },
      count: { $lt: params.limit },
    },
    { $inc: { count: 1 } },
    { new: true },
  );

  if (incremented) {
    return {
      ok: true,
      remaining: Math.max(0, params.limit - incremented.count),
    };
  }

  const current = await RateLimitBucketModel.findOne({ key: params.key }).lean();
  if (
    current &&
    current.resetAt.getTime() > now &&
    current.count >= params.limit
  ) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt.getTime() - now) / 1000),
    );
    return { ok: false, retryAfterSeconds, remaining: 0 };
  }

  // Expired or missing bucket — reset window atomically
  await RateLimitBucketModel.findOneAndUpdate(
    { key: params.key },
    { $set: { resetAt, count: 1 } },
    { upsert: true },
  );

  return { ok: true, remaining: Math.max(0, params.limit - 1) };
}
