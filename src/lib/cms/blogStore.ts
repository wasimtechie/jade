import { connectDB } from "@/lib/db";
import { ContentPageModel } from "@/models/ContentPage";
import {
  BLOG_POSTS,
  getPostBySlug as getStaticPostBySlug,
  getPublishedPosts as getStaticPublishedPosts,
  type BlogPost,
} from "@/data/blogs";
import {
  cmsSectionToBlogSection,
  normalizeBlogMeta,
  type CmsBlogMeta,
  type CmsBlogSection,
} from "@/lib/cms/blogCmsMeta";

const DEFAULT_HERO = "/og-default.jpg";

type CmsPageDoc = {
  pageKey: string;
  status: string;
  meta?: CmsBlogMeta | null;
  sections?: CmsBlogSection[];
  updatedAt?: Date | string;
};

function cmsIdFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return -Math.abs(hash || 1);
}

export function cmsPageToBlogPost(page: CmsPageDoc): BlogPost {
  const meta = normalizeBlogMeta(page.meta);
  const slug = meta.slug || page.pageKey.replace(/^blog\//, "");
  const updated =
    page.updatedAt != null
      ? new Date(page.updatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  return {
    id: cmsIdFromSlug(slug),
    slug,
    title: meta.title || slug,
    excerpt: meta.excerpt,
    description:
      meta.description ||
      meta.excerpt ||
      "Read the latest from Jade Hospitainment Journal.",
    image: meta.image?.trim() || DEFAULT_HERO,
    thumbnail: meta.thumbnailImage?.trim() || undefined,
    link: `/${slug}/`,
    date: meta.publishedAt?.slice(0, 10) ?? updated,
    dateModified: meta.dateModified?.slice(0, 10),
    category: meta.category || "Journal",
    readTime: meta.readTime,
    author: meta.author,
    tags: meta.tags,
    isFeatured: meta.isFeatured,
    isPublished: true,
    faqs: meta.faqs,
    schemas: meta.schemas,
    seo: meta.seo,
    advancedSchema: meta.advancedSchema,
    sections: (page.sections ?? []).map(cmsSectionToBlogSection),
  };
}

export async function getCmsPublishedPosts(): Promise<BlogPost[]> {
  try {
    await connectDB();
    const pages = await ContentPageModel.find({
      pageKey: /^blog\//,
      status: { $in: ["published"] },
    })
      // Lists, related cards and sitemaps only need metadata, not every article body.
      .select("pageKey status meta updatedAt")
      .sort({ "meta.publishedAt": -1, updatedAt: -1 })
      .lean();

    return pages.map((p) => cmsPageToBlogPost(p as CmsPageDoc));
  } catch (e) {
    console.error("[blogStore] getCmsPublishedPosts", e);
    return [];
  }
}

export async function getCmsPostBySlug(slug: string): Promise<BlogPost | null> {
  const decoded = decodeURIComponent(slug).toLowerCase();
  try {
    await connectDB();
    const page = await ContentPageModel.findOne({
      pageKey: `blog/${decoded}`,
      status: "published",
    }).lean();

    if (!page) return null;
    return cmsPageToBlogPost(page as CmsPageDoc);
  } catch (e) {
    console.error("[blogStore] getCmsPostBySlug", e);
    return null;
  }
}

/** CMS posts override static posts when slugs collide. */
export async function getMergedPublishedPosts(): Promise<BlogPost[]> {
  const cms = await getCmsPublishedPosts();
  const cmsSlugs = new Set(cms.map((p) => p.slug.toLowerCase()));
  const staticPosts = getStaticPublishedPosts().filter(
    (p) => !cmsSlugs.has(p.slug.toLowerCase()),
  );
  return [...cms, ...staticPosts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export async function getMergedPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const cms = await getCmsPostBySlug(slug);
  if (cms) return cms;
  return getStaticPostBySlug(slug);
}

/** For build-time static params: static slugs only (CMS resolved at runtime). */
export function getStaticBlogSlugs(): string[] {
  return getStaticPublishedPosts().map((p) => p.slug);
}

export { BLOG_POSTS };
