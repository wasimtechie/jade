import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidatePathsForPageKey } from "@/lib/cms/cmsRoutes";
import { blogSlugError } from "@/lib/cms/blogSlug";
import { auditLog } from "@/lib/audit/auditLog";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ContentPageModel } from "@/models/ContentPage";
import { sanitizeHtmlSection } from "@/lib/cms/blogCmsSanitize";
import { z } from "zod";

export const dynamic = "force-dynamic";

const faqItemSchema = z.object({
  question: z.string().max(500),
  answer: z.string().max(5000),
});

const schemasSchema = z
  .object({
    article: z.boolean().optional(),
    faq: z.boolean().optional(),
    howTo: z.boolean().optional(),
    breadcrumb: z.boolean().optional(),
  })
  .optional();

const seoSchema = z
  .object({
    metaTitle: z.string().max(120).optional(),
    focusKeyword: z.string().max(80).optional(),
    canonicalUrl: z.string().max(500).optional(),
    ogTitle: z.string().max(120).optional(),
    ogDescription: z.string().max(320).optional(),
    ogImage: z.string().max(500).optional(),
    robotsIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
  })
  .optional();

const metaSchema = z.object({
  title: z.string().max(200).optional(),
  slug: z.string().max(120).optional(),
  excerpt: z.string().max(500).optional(),
  description: z.string().max(320).optional(),
  image: z.string().max(500).optional(),
  thumbnailImage: z.string().max(500).optional(),
  author: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  readTime: z.string().max(40).optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().max(40).optional(),
  dateModified: z.string().max(40).optional(),
  scheduledAt: z.string().max(40).optional(),
  scheduledPublishAt: z.string().max(40).optional(),
  internalNotes: z.string().max(5000).optional(),
  isPinned: z.boolean().optional(),
  featuredOrder: z.number().optional(),
  previousSlugs: z.array(z.string()).optional(),
  faqs: z.array(faqItemSchema).max(50).optional(),
  schemas: schemasSchema,
  seo: seoSchema,
  advancedSchema: z
    .object({
      type: z.enum(["none", "faq", "howto", "article"]),
      faqs: z.array(faqItemSchema).max(50).optional(),
    })
    .optional(),
});

const pageSchema = z.object({
  pageKey: z.string().min(1).max(120),
  meta: metaSchema.optional(),
  sections: z.array(z.record(z.string(), z.unknown())).max(50).optional(),
  status: z.enum([
    "draft",
    "in_review",
    "approved",
    "scheduled",
    "published",
    "archived",
    "trashed",
  ]).optional(),
});

async function assertUniqueBlogSlug(
  pageKey: string,
  slug: string | undefined,
): Promise<string | null> {
  const value = slug?.trim() || (pageKey.startsWith("blog/") ? pageKey.slice(5) : "");
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (pageKey.startsWith("blog/")) {
    const invalid = blogSlugError(normalized);
    if (invalid) return invalid;
  }
  const targetKey = `blog/${normalized}`;
  const conflict = await ContentPageModel.findOne({
    pageKey: { $ne: pageKey },
    $or: [{ pageKey: targetKey }, { "meta.slug": normalized }],
  })
    .select("pageKey")
    .lean();
  if (conflict) {
    return `Slug "${normalized}" is already used by another blog post`;
  }
  return null;
}

function sanitizeSections(
  sections: Record<string, unknown>[],
): Record<string, unknown>[] {
  return sections.map((section) => {
    if (section.type === "html" && typeof section.rawHtml === "string") {
      const rawHtml = sanitizeHtmlSection(section.rawHtml);
      if (section.rawHtml.trim() && !rawHtml.trim()) {
        throw new Error(
          "HTML block was removed by sanitization — remove scripts and unsafe markup, then retry.",
        );
      }
      return {
        ...section,
        type: "html",
        rawHtml,
      };
    }
    return section;
  });
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const pageKey = req.nextUrl.searchParams.get("pageKey")?.trim();
    if (pageKey) {
      const page = await ContentPageModel.findOne({
        pageKey: decodeURIComponent(pageKey),
      }).lean();
      if (!page) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ page });
    }
    const pages = await ContentPageModel.find().sort({ pageKey: 1 }).limit(200);
    return NextResponse.json({ pages });
  } catch (e) {
    console.error("[GET /api/dashboard/content]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const parsed = pageSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const slug = parsed.data.meta?.slug?.trim().toLowerCase();
    const slugError = await assertUniqueBlogSlug(parsed.data.pageKey, slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 409 });
    }

    const existing = await ContentPageModel.findOne({
      pageKey: parsed.data.pageKey,
    });

    let sections: Record<string, unknown>[] | undefined;
    if (parsed.data.sections !== undefined) {
      try {
        sections = sanitizeSections(parsed.data.sections);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Invalid HTML in content sections";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const page = existing
      ? await ContentPageModel.findOneAndUpdate(
          { pageKey: parsed.data.pageKey },
          {
            ...(parsed.data.meta ? { meta: parsed.data.meta } : {}),
            ...(sections !== undefined ? { sections } : {}),
            status: parsed.data.status ?? existing.status,
            updatedBy: auth.userId,
            $push: {
              versions: {
                updatedBy: auth.userId,
                updatedAt: new Date(),
                snapshot: {
                  meta: parsed.data.meta ?? existing.meta,
                  ...(parsed.data.sections !== undefined
                    ? { sections: parsed.data.sections }
                    : {}),
                },
              },
            },
          },
          { new: true },
        )
      : await ContentPageModel.create({
          pageKey: parsed.data.pageKey,
          meta: parsed.data.meta,
          sections: sections ?? [],
          status: parsed.data.status ?? "draft",
          updatedBy: auth.userId,
          versions: [
            {
              updatedBy: auth.userId,
              updatedAt: new Date(),
              snapshot: {
                meta: parsed.data.meta,
                sections: parsed.data.sections,
              },
            },
          ],
        });

    await auditLog({
      action: "content.save",
      targetType: "content_page",
      targetId: String(page?._id),
      userId: auth.userId,
      metadata: { pageKey: parsed.data.pageKey },
    });

    return NextResponse.json({ page }, { status: existing ? 200 : 201 });
  } catch (e) {
    console.error("[POST /api/dashboard/content]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      pageKey?: string;
      publish?: boolean;
      meta?: Record<string, unknown>;
      sections?: Record<string, unknown>[];
    };
    if (!body.pageKey) {
      return NextResponse.json({ error: "pageKey required" }, { status: 400 });
    }

    await connectDB();

    if (body.meta) {
      const parsedMeta = metaSchema.safeParse(body.meta);
      if (!parsedMeta.success) {
        return NextResponse.json({ error: "Invalid meta" }, { status: 400 });
      }
      const slugError = await assertUniqueBlogSlug(
        body.pageKey,
        parsedMeta.data.slug,
      );
      if (slugError) {
        return NextResponse.json({ error: slugError }, { status: 409 });
      }
      const page = await ContentPageModel.findOneAndUpdate(
        { pageKey: body.pageKey },
        {
          meta: parsedMeta.data,
          updatedBy: auth.userId,
          $push: {
            versions: {
              updatedBy: auth.userId,
              updatedAt: new Date(),
              snapshot: { meta: parsedMeta.data },
            },
          },
        },
        { new: true },
      );
      if (!page) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await auditLog({
        action: "content.save",
        targetType: "content_page",
        targetId: String(page._id),
        userId: auth.userId,
        metadata: { pageKey: body.pageKey },
      });
      return NextResponse.json({ page });
    }

    if (body.sections) {
      const parsed = pageSchema.safeParse({
        pageKey: body.pageKey,
        sections: body.sections,
      });
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid sections" }, { status: 400 });
      }
      let sanitized: Record<string, unknown>[];
      try {
        sanitized = sanitizeSections(body.sections);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Invalid HTML in content sections";
        return NextResponse.json({ error: message }, { status: 400 });
      }
      const page = await ContentPageModel.findOneAndUpdate(
        { pageKey: body.pageKey },
        {
          sections: sanitized,
          updatedBy: auth.userId,
          $push: {
            versions: {
              updatedBy: auth.userId,
              updatedAt: new Date(),
              snapshot: { sections: parsed.data.sections },
            },
          },
        },
        { new: true },
      );
      if (!page) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await auditLog({
        action: "content.save",
        targetType: "content_page",
        targetId: String(page._id),
        userId: auth.userId,
        metadata: { pageKey: body.pageKey },
      });
      return NextResponse.json({ page });
    }

    const page = await ContentPageModel.findOneAndUpdate(
      { pageKey: body.pageKey },
      { status: body.publish ? "published" : "draft" },
      { new: true },
    );
    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.publish) {
      for (const path of revalidatePathsForPageKey(body.pageKey)) {
        revalidatePath(path);
      }
    }

    await auditLog({
      action: body.publish ? "content.publish" : "content.unpublish",
      targetType: "content_page",
      targetId: String(page._id),
      userId: auth.userId,
    });

    return NextResponse.json({ page });
  } catch (e) {
    console.error("[PATCH /api/dashboard/content]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
