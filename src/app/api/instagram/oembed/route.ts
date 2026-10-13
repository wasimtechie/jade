import { NextResponse } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { readJsonBody, SafeJsonError } from "@/lib/security/safeJson";

type InstagramPost = {
  id: string;
  type: "p" | "reel";
};

type OEmbedOk = {
  thumbnail_url?: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
};

function buildInstagramUrl(post: InstagramPost) {
  return `https://www.instagram.com/${post.type}/${post.id}/`;
}

const MAX_BODY_BYTES = 24 * 1024;
const MAX_POSTS = 12;

async function fetchOembed(url: string) {
  // Public oEmbed endpoint (no token). Instagram may rate-limit; we handle failures per-item.
  const endpoint = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint, {
    // Cache on the server to reduce churn/rate-limit.
    next: { revalidate: 60 * 60 * 12 },
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Jade_ReVamp/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`oEmbed request failed (${res.status})`);
  }
  return (await res.json()) as OEmbedOk;
}

export async function POST(req: Request) {
  const ip = getClientIpFromHeaders(req.headers);
  const rl = rateLimit({
    key: `instagram:oembed:${ip}`,
    limit: 60,
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

  let body: unknown;
  try {
    body = await readJsonBody(req, MAX_BODY_BYTES);
  } catch (e) {
    if (e instanceof SafeJsonError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const posts = (body as any)?.posts as InstagramPost[] | undefined;
  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "Missing posts[]" }, { status: 400 });
  }

  if (posts.length > 48) {
    return NextResponse.json(
      { error: "Too many posts in one request" },
      { status: 400 },
    );
  }

  const unique = new Map<string, InstagramPost>();
  for (const p of posts) {
    if (!p?.id || (p?.type !== "p" && p?.type !== "reel")) continue;
    if (!/^[A-Za-z0-9_-]{1,48}$/.test(String(p.id))) continue;
    if (unique.size >= MAX_POSTS) break;
    unique.set(`${p.type}:${p.id}`, { id: p.id, type: p.type });
  }

  const entries = Array.from(unique.entries());
  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No valid Instagram posts supplied" },
      { status: 400 },
    );
  }

  // Fetch in parallel, but keep it reasonably bounded.
  const chunkSize = 5;
  const results: Record<
    string,
    { url: string; thumbnailUrl?: string; ok: boolean }
  > = {};

  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const chunkRes = await Promise.allSettled(
      chunk.map(async ([key, post]) => {
        const url = buildInstagramUrl(post);
        const oembed = await fetchOembed(url);
        return {
          key,
          url,
          thumbnailUrl: oembed.thumbnail_url,
        };
      }),
    );

    for (let idx = 0; idx < chunk.length; idx++) {
      const [key, post] = chunk[idx];
      const url = buildInstagramUrl(post);
      const r = chunkRes[idx];
      if (r.status === "fulfilled") {
        results[key] = { url, thumbnailUrl: r.value.thumbnailUrl, ok: true };
      } else {
        results[key] = { url, ok: false };
      }
    }
  }

  return NextResponse.json({ items: results });
}

