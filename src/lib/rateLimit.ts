type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number; remaining: 0 };

type Bucket = { resetAt: number; count: number };

const globalForRateLimit = globalThis as unknown as {
  __jadeRateLimit?: Map<string, Bucket>;
};

function store() {
  if (!globalForRateLimit.__jadeRateLimit) {
    globalForRateLimit.__jadeRateLimit = new Map();
  }
  return globalForRateLimit.__jadeRateLimit;
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xrip = headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "unknown";
}

export function rateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = params.now ?? Date.now();
  const s = store();
  const b = s.get(params.key);

  if (!b || now >= b.resetAt) {
    s.set(params.key, { resetAt: now + params.windowMs, count: 1 });
    return { ok: true, remaining: Math.max(0, params.limit - 1) };
  }

  if (b.count >= params.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return { ok: false, retryAfterSeconds, remaining: 0 };
  }

  b.count += 1;
  s.set(params.key, b);
  return { ok: true, remaining: Math.max(0, params.limit - b.count) };
}

