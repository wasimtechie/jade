import { connectDB } from "@/lib/db";
import { SeoRedirectModel } from "@/models/SeoRedirect";

export type RedirectTestStatus = "active" | "broken" | "conflict" | "loop" | "untested";

function normalizePath(path: string): string {
  const p = path.trim();
  if (!p) return "/";
  return p.startsWith("/") ? p.replace(/\/+$/, "") || "/" : `/${p.replace(/\/+$/, "")}`;
}

export function testRedirect(
  fromPath: string,
  toPath: string,
  allRedirects: { fromPath: string; toPath: string }[] = [],
): { status: RedirectTestStatus; message?: string } {
  const from = normalizePath(fromPath);
  const to = normalizePath(toPath);

  if (!to || to === from) {
    return { status: "broken", message: "Invalid target" };
  }

  const conflicts = allRedirects.filter(
    (r) => normalizePath(r.fromPath) === from && normalizePath(r.toPath) !== to,
  );
  if (conflicts.length > 1) {
    return { status: "conflict", message: "Multiple targets for same source" };
  }

  const visited = new Set<string>([from]);
  let current = to;
  for (let i = 0; i < 10; i++) {
    const next = allRedirects.find((r) => normalizePath(r.fromPath) === current);
    if (!next) break;
    current = normalizePath(next.toPath);
    if (visited.has(current)) {
      return { status: "loop", message: "Redirect chain loops" };
    }
    visited.add(current);
  }

  return { status: "active" };
}

export async function listRedirects() {
  await connectDB();
  const rows = await SeoRedirectModel.find().sort({ fromPath: 1 }).lean();
  const all = rows.map((r) => ({
    fromPath: (r as { fromPath: string }).fromPath,
    toPath: (r as { toPath: string }).toPath,
  }));

  return rows.map((r) => {
    const row = r as {
      _id: { toString(): string };
      fromPath: string;
      toPath: string;
      type: string;
      status: string;
      testStatus?: string;
      lastTestedAt?: Date;
      note?: string;
      createdAt?: Date;
      updatedAt?: Date;
    };
    const test = testRedirect(row.fromPath, row.toPath, all);
    return {
      ...row,
      _id: row._id.toString(),
      testStatus: test.status,
      testMessage: test.message,
    };
  });
}

export async function createRedirect(input: {
  fromPath: string;
  toPath: string;
  type?: "301" | "302";
  note?: string;
  userId: string;
}) {
  await connectDB();
  const fromPath = normalizePath(input.fromPath);
  const toPath = normalizePath(input.toPath);

  const existing = await SeoRedirectModel.findOne({ fromPath });
  if (existing) {
    throw new Error("A redirect already exists for this path");
  }

  const all = await SeoRedirectModel.find({ status: "active" })
    .select("fromPath toPath")
    .lean();
  const test = testRedirect(fromPath, toPath, all as { fromPath: string; toPath: string }[]);
  if (test.status === "loop") {
    throw new Error("This redirect would create a loop");
  }

  const created = await SeoRedirectModel.create({
    fromPath,
    toPath,
    type: input.type ?? "301",
    note: input.note,
    testStatus: test.status,
    lastTestedAt: new Date(),
    createdBy: input.userId,
    updatedBy: input.userId,
  });
  invalidateRedirectCache();
  return created;
}

export async function updateRedirect(
  id: string,
  input: Partial<{
    toPath: string;
    type: "301" | "302";
    status: "active" | "disabled";
    note: string;
  }>,
  userId: string,
) {
  await connectDB();
  const update: Record<string, unknown> = { ...input, updatedBy: userId };
  if (input.toPath) update.toPath = normalizePath(input.toPath);
  const updated = await SeoRedirectModel.findByIdAndUpdate(id, update, {
    new: true,
  });
  invalidateRedirectCache();
  return updated;
}

export async function deleteRedirect(id: string) {
  await connectDB();
  const deleted = await SeoRedirectModel.findByIdAndDelete(id);
  invalidateRedirectCache();
  return deleted;
}

type RedirectHit = { toPath: string; type: "301" | "302" };

const REDIRECT_MAP_CACHE_TTL_MS = 60_000;

let activeRedirectCache: {
  byFrom: Map<string, RedirectHit>;
  expiresAt: number;
} | null = null;

/** Bust in-process redirect map after dashboard CRUD. */
export function invalidateRedirectCache(): void {
  activeRedirectCache = null;
}

async function getActiveRedirectMap(): Promise<Map<string, RedirectHit>> {
  const now = Date.now();
  if (activeRedirectCache && activeRedirectCache.expiresAt > now) {
    return activeRedirectCache.byFrom;
  }

  await connectDB();
  const rows = await SeoRedirectModel.find({ status: "active" })
    .select("fromPath toPath type")
    .lean();

  const byFrom = new Map<string, RedirectHit>();
  for (const row of rows) {
    const r = row as { fromPath: string; toPath: string; type?: string };
    byFrom.set(normalizePath(r.fromPath), {
      toPath: r.toPath,
      type: (r.type as "301" | "302") ?? "301",
    });
  }

  activeRedirectCache = {
    byFrom,
    expiresAt: now + REDIRECT_MAP_CACHE_TTL_MS,
  };
  return byFrom;
}

export async function resolveRedirectPath(pathname: string): Promise<RedirectHit | null> {
  try {
    const map = await getActiveRedirectMap();
    return map.get(normalizePath(pathname)) ?? null;
  } catch {
    return null;
  }
}

export async function suggestRedirectFromSlugChange(
  oldSlug: string,
  newSlug: string,
  contentType: "blog" | "villa" = "blog",
) {
  const base = contentType === "blog" ? "/blogs" : "/retreat";
  return {
    fromPath: `${base}/${oldSlug}${contentType === "villa" ? "/" : ""}`,
    toPath: `${base}/${newSlug}${contentType === "villa" ? "/" : ""}`,
    type: "301" as const,
  };
}
