import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auditLog } from "@/lib/audit/auditLog";
import { ContentPageModel } from "@/models/ContentPage";
import { AuditLogModel } from "@/models/AuditLog";
import { revalidatePathsForPageKey } from "@/lib/cms/cmsRoutes";
import { blogSlugError } from "@/lib/cms/blogSlug";
import {
  cloneSectionsWithNewKeys,
  normalizeBlogMeta,
  slugifyTitle,
  type CmsBlogMeta,
  type CmsBlogSection,
  type CmsPageStatus,
} from "@/lib/cms/blogCmsMeta";
import { computeBlogSeoHealth, seoScoreBucket } from "@/lib/cms/blogSeoHealth";
import { canTransition, nextStatus, type WorkflowAction } from "@/lib/cms/blogWorkflow";

const BLOG_PREFIX = /^blog\//;
const TRASH_RETENTION_DAYS = 30;
const LOCK_TTL_MS = 15 * 60 * 1000;
const MAX_VERSIONS = 50;

export type BlogListQuery = {
  q?: string;
  status?: string;
  category?: string;
  author?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  seoScore?: "good" | "fair" | "poor";
  schemaType?: string;
  featured?: boolean;
  includeTrashed?: boolean;
  page?: number;
  limit?: number;
  sort?: "updated" | "published" | "title";
};

export type BlogListItem = {
  _id: string;
  pageKey: string;
  status: CmsPageStatus;
  meta: CmsBlogMeta;
  sections: CmsBlogSection[];
  updatedAt?: string;
  createdAt?: string;
  trashedAt?: string;
  editLock?: {
    userId?: string;
    userName?: string;
    lockedAt?: string;
    expiresAt?: string;
  };
  seoHealth: ReturnType<typeof computeBlogSeoHealth>;
  sectionCount: number;
};

function pushVersion(
  page: {
    meta?: unknown;
    sections?: unknown;
    status?: string;
    internalNotes?: string;
  },
  userId: string,
  action: string,
) {
  return {
    updatedBy: userId,
    updatedAt: new Date(),
    action,
    snapshot: {
      meta: page.meta,
      sections: page.sections,
      status: page.status,
      internalNotes: page.internalNotes,
    },
  };
}

function trimVersions(versions: unknown[]) {
  if (versions.length <= MAX_VERSIONS) return versions;
  return versions.slice(versions.length - MAX_VERSIONS);
}

async function uniqueSlug(base: string, excludePageKey?: string): Promise<string> {
  let candidate = base;
  let n = 1;
  while (true) {
    const conflict = await ContentPageModel.findOne({
      pageKey: `blog/${candidate}`,
      ...(excludePageKey ? { pageKey: { $ne: excludePageKey } } : {}),
    })
      .select("pageKey")
      .lean();
    if (!conflict) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

function serializeEditLock(
  lock: BlogListItem["editLock"] | undefined,
): BlogListItem["editLock"] | undefined {
  if (!lock) return undefined;
  const lockedAt = lock.lockedAt as unknown;
  const expiresAt = lock.expiresAt as unknown;
  return {
    userId: lock.userId != null ? String(lock.userId) : undefined,
    userName: lock.userName,
    lockedAt:
      lockedAt instanceof Date
        ? lockedAt.toISOString()
        : typeof lockedAt === "string"
          ? lockedAt
          : undefined,
    expiresAt:
      expiresAt instanceof Date
        ? expiresAt.toISOString()
        : typeof expiresAt === "string"
          ? expiresAt
          : undefined,
  };
}

export async function listBlogPosts(query: BlogListQuery) {
  await connectDB();

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 50));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { pageKey: BLOG_PREFIX };

  if (!query.includeTrashed) {
    filter.status = { $ne: "trashed" };
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.category) {
    filter["meta.category"] = query.category;
  }
  if (query.author) {
    filter["meta.author"] = query.author;
  }
  if (query.tag) {
    filter["meta.tags"] = query.tag;
  }
  if (query.featured === true) {
    filter["meta.isFeatured"] = true;
  }
  if (query.dateFrom || query.dateTo) {
    const range: Record<string, string> = {};
    if (query.dateFrom) range.$gte = query.dateFrom;
    if (query.dateTo) range.$lte = query.dateTo;
    filter["meta.publishedAt"] = range;
  }
  if (query.q?.trim()) {
    const q = query.q.trim();
    filter.$or = [
      { "meta.title": { $regex: q, $options: "i" } },
      { "meta.slug": { $regex: q, $options: "i" } },
      { "meta.author": { $regex: q, $options: "i" } },
      { "meta.category": { $regex: q, $options: "i" } },
      { "meta.tags": { $regex: q, $options: "i" } },
      { "meta.seo.focusKeyword": { $regex: q, $options: "i" } },
    ];
  }

  let sort: Record<string, 1 | -1> = { updatedAt: -1 };
  if (query.sort === "published") sort = { "meta.publishedAt": -1, updatedAt: -1 };
  if (query.sort === "title") sort = { "meta.title": 1 };

  const [docs, total] = await Promise.all([
    ContentPageModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ContentPageModel.countDocuments(filter),
  ]);

  let items: BlogListItem[] = docs.map((doc) => {
    const d = doc as {
      _id: { toString(): string };
      pageKey: string;
      status: CmsPageStatus;
      meta?: CmsBlogMeta | null;
      sections?: CmsBlogSection[];
      updatedAt?: Date;
      createdAt?: Date;
      trashedAt?: Date;
      editLock?: BlogListItem["editLock"];
    };
    const meta = normalizeBlogMeta(d.meta);
    const sections = d.sections ?? [];
    const seoHealth = computeBlogSeoHealth(meta, sections, d.status);
    return {
      _id: d._id.toString(),
      pageKey: d.pageKey,
      status: d.status ?? "draft",
      meta,
      sections,
      updatedAt: d.updatedAt?.toISOString(),
      createdAt: d.createdAt?.toISOString(),
      trashedAt: d.trashedAt?.toISOString(),
      editLock: serializeEditLock(d.editLock),
      seoHealth,
      sectionCount: sections.length,
    };
  });

  if (query.seoScore) {
    items = items.filter(
      (i) => seoScoreBucket(i.seoHealth.score) === query.seoScore,
    );
  }
  if (query.schemaType) {
    items = items.filter((i) => {
      const s = i.meta.schemas;
      if (!s) return false;
      if (query.schemaType === "faq") return s.faq;
      if (query.schemaType === "howTo") return s.howTo;
      if (query.schemaType === "article") return s.article;
      return true;
    });
  }

  const facets = await ContentPageModel.aggregate([
    { $match: { pageKey: BLOG_PREFIX, status: { $ne: "trashed" } } },
    {
      $group: {
        _id: null,
        categories: { $addToSet: "$meta.category" },
        authors: { $addToSet: "$meta.author" },
        tags: { $addToSet: "$meta.tags" },
      },
    },
  ]);

  const facet = facets[0] as
    | { categories?: string[]; authors?: string[]; tags?: string[][] }
    | undefined;

  return {
    items,
    total,
    page,
    limit,
    facets: {
      categories: (facet?.categories ?? []).filter(Boolean).sort(),
      authors: (facet?.authors ?? []).filter(Boolean).sort(),
      tags: Array.from(new Set((facet?.tags ?? []).flat())).filter(Boolean).sort(),
    },
  };
}

export async function duplicateBlogPost(pageKey: string, userId: string) {
  await connectDB();
  const source = await ContentPageModel.findOne({ pageKey }).lean();
  if (!source || !BLOG_PREFIX.test(pageKey)) {
    throw new Error("Blog not found");
  }

  const src = source as {
    meta?: CmsBlogMeta;
    sections?: CmsBlogSection[];
  };
  const meta = normalizeBlogMeta(src.meta);
  const baseSlug = slugifyTitle(`copy-of-${meta.slug || meta.title}`);
  const newSlug = await uniqueSlug(baseSlug);
  const newMeta = normalizeBlogMeta({
    ...JSON.parse(JSON.stringify(meta)),
    title: `Copy of ${meta.title || meta.slug}`,
    slug: newSlug,
    publishedAt: new Date().toISOString().slice(0, 10),
    dateModified: new Date().toISOString().slice(0, 10),
    isFeatured: false,
    isPinned: false,
    featuredOrder: 0,
    scheduledAt: undefined,
    scheduledPublishAt: undefined,
  });

  const page = await ContentPageModel.create({
    pageKey: `blog/${newSlug}`,
    meta: newMeta,
    sections: cloneSectionsWithNewKeys(src.sections ?? []),
    status: "draft",
    updatedBy: userId,
    versions: [
      pushVersion(
        { meta: newMeta, sections: src.sections, status: "draft" },
        userId,
        "duplicate",
      ),
    ],
  });

  await auditLog({
    action: "content.duplicate",
    targetType: "content_page",
    targetId: String(page._id),
    userId,
    metadata: { sourcePageKey: pageKey, newPageKey: page.pageKey },
  });

  return page;
}

export async function bulkBlogAction(
  pageKeys: string[],
  action: string,
  userId: string,
  payload?: Record<string, unknown>,
) {
  await connectDB();
  const results: { pageKey: string; ok: boolean; error?: string }[] = [];

  for (const pageKey of pageKeys) {
    try {
      if (action === "delete") {
        await applyWorkflow(pageKey, "trash", userId);
      } else if (action === "publish") {
        await applyWorkflow(pageKey, "publish", userId);
      } else if (action === "unpublish") {
        await applyWorkflow(pageKey, "unpublish", userId);
      } else if (action === "archive") {
        await applyWorkflow(pageKey, "archive", userId);
      } else if (action === "restore") {
        await applyWorkflow(pageKey, "restore_trash", userId);
      } else if (action === "set_category" && typeof payload?.category === "string") {
        await ContentPageModel.updateOne(
          { pageKey },
          { $set: { "meta.category": payload.category, updatedBy: userId } },
        );
      } else if (action === "set_author" && typeof payload?.author === "string") {
        await ContentPageModel.updateOne(
          { pageKey },
          { $set: { "meta.author": payload.author, updatedBy: userId } },
        );
      } else if (action === "add_tags" && Array.isArray(payload?.tags)) {
        await ContentPageModel.updateOne(
          { pageKey },
          {
            $addToSet: { "meta.tags": { $each: payload.tags as string[] } },
            $set: { updatedBy: userId },
          },
        );
      } else if (action === "remove_tags" && Array.isArray(payload?.tags)) {
        await ContentPageModel.updateOne(
          { pageKey },
          {
            $pull: { "meta.tags": { $in: payload.tags as string[] } },
            $set: { updatedBy: userId },
          },
        );
      } else if (action === "feature") {
        await ContentPageModel.updateOne(
          { pageKey },
          { $set: { "meta.isFeatured": true, updatedBy: userId } },
        );
      } else if (action === "unfeature") {
        await ContentPageModel.updateOne(
          { pageKey },
          { $set: { "meta.isFeatured": false, updatedBy: userId } },
        );
      } else if (action === "set_noindex") {
        await ContentPageModel.updateOne(
          { pageKey },
          {
            $set: {
              "meta.seo.robotsIndex": false,
              "meta.seo.robotsFollow": true,
              updatedBy: userId,
            },
          },
        );
        revalidatePathsForPageKey(pageKey);
      } else if (action === "set_index") {
        await ContentPageModel.updateOne(
          { pageKey },
          {
            $set: {
              "meta.seo.robotsIndex": true,
              updatedBy: userId,
            },
          },
        );
        revalidatePathsForPageKey(pageKey);
      } else {
        throw new Error("Unknown bulk action");
      }
      results.push({ pageKey, ok: true });
    } catch (e) {
      results.push({
        pageKey,
        ok: false,
        error: e instanceof Error ? e.message : "Failed",
      });
    }
  }

  await auditLog({
    action: `content.bulk.${action}`,
    targetType: "content_page",
    userId,
    metadata: { pageKeys, payload },
  });

  return results;
}

export async function applyWorkflow(
  pageKey: string,
  action: WorkflowAction,
  userId: string,
  note?: string,
) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey });
  if (!page) throw new Error("Not found");

  const current = (page.status ?? "draft") as CmsPageStatus;
  if (action === "delete_permanent") {
    if (current !== "trashed") throw new Error("Only trashed blogs can be permanently deleted");
    await ContentPageModel.deleteOne({ pageKey });
    await auditLog({
      action: "content.delete",
      targetType: "content_page",
      targetId: String(page._id),
      userId,
      metadata: { pageKey },
    });
    return null;
  }

  const newStatus = nextStatus(current, action);
  if (!newStatus) throw new Error(`Cannot ${action} from status ${current}`);

  const update: Record<string, unknown> = {
    status: newStatus,
    updatedBy: userId,
  };

  if (action === "trash") {
    update.trashedAt = new Date();
  }
  if (action === "restore_trash") {
    update.trashedAt = null;
  }
  if (action === "publish") {
    update["meta.publishedAt"] =
      page.meta?.publishedAt ?? new Date().toISOString().slice(0, 10);
  }
  if (note) {
    update.internalNotes = note;
  }

  const versions = trimVersions([
    ...(page.versions ?? []),
    pushVersion(
      {
        meta: page.meta,
        sections: page.sections,
        status: page.status,
        internalNotes: page.internalNotes,
      },
      userId,
      action,
    ),
  ]);

  const updated = await ContentPageModel.findOneAndUpdate(
    { pageKey },
    { ...update, versions },
    { new: true },
  );

  if (action === "publish" || action === "unpublish" || action === "archive") {
    for (const path of revalidatePathsForPageKey(pageKey)) {
      revalidatePath(path);
    }
  }

  await auditLog({
    action: `content.${action}`,
    targetType: "content_page",
    targetId: String(page._id),
    userId,
    metadata: { pageKey, from: current, to: newStatus, note },
  });

  return updated;
}

export async function scheduleBlogPost(
  pageKey: string,
  scheduledPublishAt: string,
  userId: string,
) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey });
  if (!page) throw new Error("Not found");

  const current = (page.status ?? "draft") as CmsPageStatus;
  if (!canTransition(current, "schedule") && current !== "scheduled") {
    throw new Error(`Cannot schedule from status ${current}`);
  }

  const versions = trimVersions([
    ...(page.versions ?? []),
    pushVersion(
      {
        meta: page.meta,
        sections: page.sections,
        status: page.status,
        internalNotes: page.internalNotes,
      },
      userId,
      "schedule",
    ),
  ]);

  return ContentPageModel.findOneAndUpdate(
    { pageKey },
    {
      status: "scheduled",
      "meta.scheduledPublishAt": scheduledPublishAt,
      "meta.scheduledAt": scheduledPublishAt.slice(0, 10),
      updatedBy: userId,
      versions,
    },
    { new: true },
  );
}

export async function updateBlogSlug(
  pageKey: string,
  newSlug: string,
  userId: string,
) {
  await connectDB();
  const normalized = newSlug.trim().toLowerCase();
  const invalid = blogSlugError(normalized);
  if (invalid) throw new Error(invalid);
  const targetKey = `blog/${normalized}`;
  const conflict = await ContentPageModel.findOne({
    pageKey: targetKey,
    _id: { $ne: (await ContentPageModel.findOne({ pageKey }))?._id },
  });
  if (conflict) throw new Error("Slug already in use");

  const page = await ContentPageModel.findOne({ pageKey });
  if (!page) throw new Error("Not found");

  const oldSlug = page.meta?.slug ?? pageKey.replace(/^blog\//, "");
  const previousSlugs = [...(page.meta?.previousSlugs ?? [])];
  if (oldSlug && oldSlug !== normalized) {
    previousSlugs.push(oldSlug);
  }

  return ContentPageModel.findOneAndUpdate(
    { pageKey },
    {
      pageKey: targetKey,
      "meta.slug": normalized,
      "meta.previousSlugs": previousSlugs,
      "meta.seo.canonicalUrl": undefined,
      updatedBy: userId,
      $push: {
        versions: pushVersion(
          { meta: page.meta, sections: page.sections, status: page.status },
          userId,
          "slug_change",
        ),
      },
    },
    { new: true },
  );
}

export async function reorderFeaturedBlogs(
  orderedPageKeys: string[],
  userId: string,
) {
  await connectDB();
  for (let i = 0; i < orderedPageKeys.length; i++) {
    await ContentPageModel.updateOne(
      { pageKey: orderedPageKeys[i] },
      {
        $set: {
          "meta.isFeatured": true,
          "meta.featuredOrder": i,
          updatedBy: userId,
        },
      },
    );
  }
}

export async function getBlogVersions(pageKey: string) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey })
    .select("versions")
    .populate("versions.updatedBy", "name email")
    .lean();
  if (!page) throw new Error("Not found");
  return (page as { versions?: unknown[] }).versions ?? [];
}

export async function restoreBlogVersion(
  pageKey: string,
  versionIndex: number,
  userId: string,
) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey });
  if (!page) throw new Error("Not found");
  const versions = page.versions ?? [];
  const version = versions[versionIndex] as
    | { snapshot?: { meta?: unknown; sections?: unknown; status?: string; internalNotes?: string } }
    | undefined;
  if (!version?.snapshot) throw new Error("Version not found");

  const newVersions = trimVersions([
    ...versions,
    pushVersion(
      {
        meta: page.meta,
        sections: page.sections,
        status: page.status,
        internalNotes: page.internalNotes,
      },
      userId,
      "restore_version",
    ),
  ]);

  return ContentPageModel.findOneAndUpdate(
    { pageKey },
    {
      meta: version.snapshot.meta ?? page.meta,
      sections: version.snapshot.sections ?? page.sections,
      status: version.snapshot.status ?? page.status,
      internalNotes: version.snapshot.internalNotes ?? page.internalNotes,
      updatedBy: userId,
      versions: newVersions,
    },
    { new: true },
  );
}

export async function getBlogChangelog(pageKey: string, limit = 50) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey }).select("_id").lean();
  if (!page) throw new Error("Not found");

  const logs = await AuditLogModel.find({
    targetType: "content_page",
    $or: [
      { targetId: String((page as { _id: { toString(): string } })._id) },
      { "metadata.pageKey": pageKey },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email")
    .lean();

  return logs;
}

export async function acquireEditLock(
  pageKey: string,
  userId: string,
  userName: string,
  force = false,
) {
  await connectDB();
  const page = await ContentPageModel.findOne({ pageKey });
  if (!page) throw new Error("Not found");

  const now = new Date();
  const lock = page.editLock as
    | { userId?: { toString(): string }; expiresAt?: Date; userName?: string }
    | undefined;

  if (
    lock?.userId &&
    lock.userId.toString() !== userId &&
    lock.expiresAt &&
    lock.expiresAt > now &&
    !force
  ) {
    return {
      locked: true,
      by: lock.userName ?? "Another user",
      expiresAt: lock.expiresAt.toISOString(),
    };
  }

  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);
  await ContentPageModel.updateOne(
    { pageKey },
    {
      editLock: { userId, userName, lockedAt: now, expiresAt },
    },
  );

  return { locked: false, expiresAt: expiresAt.toISOString() };
}

export async function releaseEditLock(pageKey: string, userId: string) {
  await connectDB();
  await ContentPageModel.updateOne(
    { pageKey, "editLock.userId": userId },
    { $unset: { editLock: 1 } },
  );
}

export async function publishDueScheduledBlogs() {
  await connectDB();
  const now = new Date();
  const due = await ContentPageModel.find({
    pageKey: BLOG_PREFIX,
    status: "scheduled",
    $or: [
      { "meta.scheduledPublishAt": { $lte: now.toISOString() } },
      {
        "meta.scheduledPublishAt": { $exists: false },
        "meta.scheduledAt": { $lte: now.toISOString().slice(0, 10) },
      },
    ],
  });

  let count = 0;
  for (const page of due) {
    await ContentPageModel.updateOne(
      { _id: page._id },
      {
        status: "published",
        "meta.publishedAt":
          page.meta?.publishedAt ?? now.toISOString().slice(0, 10),
      },
    );
    for (const path of revalidatePathsForPageKey(page.pageKey)) {
      revalidatePath(path);
    }
    count += 1;
  }
  return count;
}

export async function purgeExpiredTrashedBlogs() {
  await connectDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS);

  const result = await ContentPageModel.deleteMany({
    pageKey: BLOG_PREFIX,
    status: "trashed",
    trashedAt: { $lte: cutoff },
  });
  return result.deletedCount ?? 0;
}
