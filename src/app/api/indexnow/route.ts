import { NextResponse } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";

function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (key) return key;
  if (process.env.NODE_ENV !== "production") {
    return "dev-indexnow-key-set-INDEXNOW_KEY-in-env";
  }
  return null;
}

const HOST = process.env.INDEXNOW_HOST ?? "jadehospitainment.com";

const MAX_URLS = 80;
const MAX_BODY = 64 * 1024;

function authorizeIndexNow(req: Request): boolean {
  const secret = process.env.INDEXNOW_API_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

function isHttpsAppUrl(u: string, host: string): boolean {
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return false;
    return parsed.hostname === host || parsed.hostname === `www.${host}`;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    const rl = rateLimit({
      key: `indexnow:post:${ip}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfterSeconds) },
        },
      );
    }

    if (process.env.NODE_ENV === "production" && !process.env.INDEXNOW_API_SECRET?.trim()) {
      return NextResponse.json(
        { error: "IndexNow authentication is not configured" },
        { status: 503 },
      );
    }

    if (!authorizeIndexNow(request)) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Set INDEXNOW_API_SECRET and send Authorization: Bearer <secret>.",
        },
        { status: 401 },
      );
    }

    const indexNowKey = getIndexNowKey();
    if (!indexNowKey) {
      return NextResponse.json(
        { error: "INDEXNOW_KEY is not configured" },
        { status: 503 },
      );
    }

    let parsed: unknown;
    try {
      parsed = await readJsonBody(request, MAX_BODY);
    } catch (e) {
      if (e instanceof SafeJsonError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      throw e;
    }

    const urls =
      parsed &&
      typeof parsed === "object" &&
      parsed !== null &&
      "urls" in parsed
        ? (parsed as { urls?: unknown }).urls
        : undefined;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "urls array is required in the request body" },
        { status: 400 },
      );
    }

    if (urls.length > MAX_URLS) {
      return NextResponse.json(
        { error: `At most ${MAX_URLS} URLs per request` },
        { status: 400 },
      );
    }

    const host = HOST.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const clean = urls.filter(
      (u): u is string => typeof u === "string" && isHttpsAppUrl(u, host),
    );
    if (clean.length !== urls.length) {
      return NextResponse.json(
        {
          error: `Every URL must be https and on host ${host} or www.${host}`,
        },
        { status: 400 },
      );
    }

    const payload = {
      host,
      key: indexNowKey,
      keyLocation: `https://${host}/${indexNowKey}.txt`,
      urlList: clean,
    };

    // Ping Bing
    const bingResponse = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Ping Yandex (which handles Seznam and IndexNow default too)
    const yandexResponse = await fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      bingStatus: bingResponse.status,
      yandexStatus: yandexResponse.status,
      message: "Successfully pinged IndexNow endpoints",
    });
  } catch (error) {
    console.error("IndexNow ping failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error while pinging IndexNow" },
      { status: 500 },
    );
  }
}
