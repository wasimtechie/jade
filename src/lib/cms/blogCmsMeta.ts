import type { BlogPost, BlogSection } from "@/data/blogs";

export type AdvancedSchemaType = "none" | "faq" | "howto" | "article";

export type CmsAdvancedSchema = {
  type: AdvancedSchemaType;
  faqs?: { question: string; answer: string }[];
};

/** Extensible multi-schema toggles — add new ids here without refactoring consumers. */
export const BLOG_SCHEMA_IDS = [
  "article",
  "faq",
  "howTo",
  "breadcrumb",
] as const;

export type BlogSchemaId = (typeof BLOG_SCHEMA_IDS)[number];

export type CmsBlogSchemas = Record<BlogSchemaId, boolean>;

export type CmsBlogFaq = { question: string; answer: string };

/** Mongo may return Date objects; UI/API expect YYYY-MM-DD strings. */
export function coerceIsoDateOnly(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return undefined;
}

/** Mongo may return Date for datetime fields (e.g. scheduledPublishAt). */
export function coerceIsoDateTime(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return undefined;
}

export type CmsBlogSeo = {
  metaTitle?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
};

export type CmsBlogMeta = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  image: string;
  thumbnailImage?: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  featuredOrder?: number;
  publishedAt: string;
  dateModified?: string;
  scheduledAt?: string;
  /** ISO datetime for scheduled publish (date + time). */
  scheduledPublishAt?: string;
  faqs?: CmsBlogFaq[];
  schemas?: CmsBlogSchemas;
  seo?: CmsBlogSeo;
  internalNotes?: string;
  previousSlugs?: string[];
  /** Future analytics — populated when tracking is enabled. */
  analytics?: {
    views?: number;
    organicTraffic?: number;
    ctr?: number;
    rankingKeywords?: string[];
    engagement?: number;
  };
  /** @deprecated Legacy single-schema — kept for backward compatibility. */
  advancedSchema?: CmsAdvancedSchema;
};

export type CmsPageStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived"
  | "trashed";

export type CmsEditLock = {
  userId?: string;
  userName?: string;
  lockedAt?: string;
  expiresAt?: string;
};

export type CmsBlogVersion = {
  updatedBy?: string;
  updatedAt?: string;
  action?: string;
  snapshot?: {
    meta?: CmsBlogMeta;
    sections?: CmsBlogSection[];
    status?: CmsPageStatus;
    internalNotes?: string;
  };
};

export const BLOG_SCHEMA_LABELS: Record<BlogSchemaId, string> = {
  article: "Article",
  faq: "FAQ",
  howTo: "HowTo",
  breadcrumb: "Breadcrumb",
};

export type CmsBlogSection = {
  sectionKey: string;
  type?: BlogSection["type"];
  heading?: string;
  body?: string;
  content?: string;
  image?: string;
  caption?: string;
  level?: number;
  items?: string[];
  tableData?: { headers: string[]; rows: string[][] };
  faqs?: { question: string; answer: string }[];
  ctas?: { label: string; link: string; variant: string }[];
  rawHtml?: string;
  settings?: import("@/lib/cms/blogBlocks").BlogBlockSettings;
};

export const BLOG_TEMPLATE_SLUGS = [
  "corporate-team-outing-bangalore-guide",
  "the-art-of-slow-living",
  "hosting-unforgettable-events-jade",
] as const;

export function defaultAdvancedSchema(): CmsAdvancedSchema {
  return { type: "article" };
}

export function defaultBlogSchemas(): CmsBlogSchemas {
  return { article: true, faq: false, howTo: false, breadcrumb: true };
}

export function defaultBlogSeo(): CmsBlogSeo {
  return { robotsIndex: true, robotsFollow: true };
}

/** Map legacy `advancedSchema.type` + faqs into the new multi-schema shape. */
export function schemasFromLegacy(
  advanced?: CmsAdvancedSchema | null,
): CmsBlogSchemas {
  const base = defaultBlogSchemas();
  if (!advanced) return base;
  switch (advanced.type) {
    case "none":
      return { article: false, faq: false, howTo: false, breadcrumb: true };
    case "faq":
      return { ...base, faq: true };
    case "howto":
      return { ...base, howTo: true, article: false };
    case "article":
    default:
      return base;
  }
}

/** Keep legacy `advancedSchema` in sync when saving from the new wizard. */
export function legacyAdvancedFromSchemas(
  schemas: CmsBlogSchemas,
  faqs?: CmsBlogFaq[],
): CmsAdvancedSchema {
  if (!schemas.article && !schemas.faq && !schemas.howTo) {
    return { type: "none", faqs: faqs?.length ? faqs : undefined };
  }
  if (schemas.howTo && !schemas.article) {
    return { type: "howto" };
  }
  if (schemas.faq) {
    return {
      type: "faq",
      faqs: faqs?.length ? faqs : undefined,
    };
  }
  return { type: "article" };
}

export function normalizeBlogMeta(
  raw: Partial<CmsBlogMeta> | null | undefined,
): CmsBlogMeta {
  const today = new Date().toISOString().slice(0, 10);
  const schemas =
    raw?.schemas ?? schemasFromLegacy(raw?.advancedSchema ?? null);
  const faqs =
    raw?.faqs?.length
      ? raw.faqs
      : raw?.advancedSchema?.faqs?.length
        ? raw.advancedSchema.faqs
        : [];

  return {
    title: raw?.title ?? "",
    slug: raw?.slug ?? "",
    excerpt: raw?.excerpt ?? "",
    description: raw?.description ?? "",
    image: raw?.image ?? "",
    thumbnailImage: raw?.thumbnailImage,
    author: raw?.author ?? "Jade Hospitainment",
    category: raw?.category ?? "",
    tags: Array.isArray(raw?.tags)
      ? raw.tags.map(String)
      : raw?.tags
        ? [String(raw.tags)]
        : [],
    readTime: raw?.readTime ?? "5 min read",
    isFeatured: raw?.isFeatured ?? false,
    isPinned: raw?.isPinned ?? false,
    featuredOrder: raw?.featuredOrder ?? 0,
    publishedAt: coerceIsoDateOnly(raw?.publishedAt) ?? today,
    dateModified: coerceIsoDateOnly(raw?.dateModified),
    scheduledAt: coerceIsoDateOnly(raw?.scheduledAt),
    scheduledPublishAt: coerceIsoDateTime(raw?.scheduledPublishAt),
    faqs,
    schemas,
    seo: { ...defaultBlogSeo(), ...raw?.seo },
    internalNotes: raw?.internalNotes ?? "",
    previousSlugs: raw?.previousSlugs ?? [],
    analytics: raw?.analytics ?? {
      views: 0,
      organicTraffic: 0,
      ctr: 0,
      rankingKeywords: [],
      engagement: 0,
    },
    advancedSchema: legacyAdvancedFromSchemas(schemas, faqs),
  };
}

export function resolvePageStatus(
  status: CmsPageStatus,
  publishedAt: string,
  scheduledPublishAt?: string,
): CmsPageStatus {
  if (status === "trashed" || status === "archived") return status;
  if (status !== "scheduled") return status;

  const when = scheduledPublishAt || publishedAt;
  if (!when) return "scheduled";

  const target = new Date(when);
  if (!Number.isNaN(target.getTime()) && target <= new Date()) {
    return "published";
  }
  return "scheduled";
}

export const SITE_ORIGIN = "https://jadehospitainment.com";

export function defaultCanonicalUrl(slug: string): string {
  return `${SITE_ORIGIN}/${slug}/`;
}

/** Resolve multi-schema flags from CMS meta or legacy single-type field. */
export function resolvePostSchemas(post: {
  schemas?: Partial<CmsBlogSchemas>;
  advancedSchema?: CmsAdvancedSchema;
}): CmsBlogSchemas {
  if (post.schemas) {
    return { ...defaultBlogSchemas(), ...post.schemas };
  }
  return schemasFromLegacy(post.advancedSchema);
}

export function resolvePostFaqs(post: {
  faqs?: CmsBlogFaq[];
  advancedSchema?: CmsAdvancedSchema;
  sections?: { type?: string; faqs?: CmsBlogFaq[] }[];
}): CmsBlogFaq[] {
  const sectionFaqs = post.sections?.find((s) => s.type === "faq")?.faqs;
  if (sectionFaqs?.length) return sectionFaqs;
  if (post.faqs?.length) return post.faqs;
  if (post.advancedSchema?.type === "faq" && post.advancedSchema.faqs?.length) {
    return post.advancedSchema.faqs;
  }
  return [];
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function inferBuilderMode(
  sections: CmsBlogSection[] | undefined,
): "manual" | "html" {
  if (!sections?.length) return "manual";
  const htmlOnly = sections.every((s) => s.type === "html");
  if (htmlOnly && sections.length === 1) return "html";
  return "manual";
}

export function hasBuiltSections(sections: CmsBlogSection[] | undefined): boolean {
  if (!sections?.length) return false;
  return sections.some(
    (s) =>
      s.type === "html" ||
      Boolean(s.content?.trim()) ||
      Boolean(s.body?.trim()) ||
      Boolean(s.image) ||
      (s.items && s.items.length > 0) ||
      (s.faqs && s.faqs.length > 0) ||
      (s.ctas && s.ctas.length > 0),
  );
}

export function cloneSectionsWithNewKeys(
  sections: CmsBlogSection[],
): CmsBlogSection[] {
  return sections.map((s, i) => ({
    ...JSON.parse(JSON.stringify(s)),
    sectionKey: `block-${i + 1}-${Date.now()}`,
  }));
}

export function blogSectionToCms(
  section: BlogSection,
  index: number,
): CmsBlogSection {
  const base = { sectionKey: `block-${index + 1}`, type: section.type };
  switch (section.type) {
    case "html":
      return { ...base, rawHtml: section.rawHtml };
    case "heading":
      return {
        ...base,
        content: section.content,
        level: section.level,
      };
    case "text":
    case "quote":
      return { ...base, content: section.content };
    case "image":
      return {
        ...base,
        image: section.image,
        caption: section.caption,
      };
    case "list":
      return { ...base, items: section.items };
    case "table":
      return { ...base, tableData: section.tableData };
    case "faq":
      return { ...base, faqs: section.faqs };
    case "cta":
      return { ...base, content: section.content, ctas: section.ctas, settings: section.settings };
    case "button":
    case "gallery":
    case "video":
    case "callout":
    case "divider":
      return {
        ...base,
        content: section.content,
        image: section.image,
        caption: section.caption,
        ctas: section.ctas,
        settings: section.settings,
        rawHtml: section.rawHtml,
      };
    default:
      return { ...base, content: section.content, settings: section.settings };
  }
}

export function cmsSectionToBlogSection(section: CmsBlogSection): BlogSection {
  const type = section.type ?? "text";
  if (type === "html") {
    return { type: "html", rawHtml: section.rawHtml ?? "" };
  }
  if (type === "heading") {
    const lvl = section.level ?? 2;
    return {
      type: "heading",
      content: section.content ?? section.heading ?? "",
      level: (lvl >= 1 && lvl <= 6 ? lvl : 2) as BlogSection["level"],
      settings: section.settings,
    };
  }
  if (type === "image") {
    return {
      type: "image",
      image: section.image,
      caption: section.caption,
      settings: section.settings,
    };
  }
  if (type === "list") {
    return {
      type: "list",
      items: section.items ?? [],
      settings: section.settings,
    };
  }
  if (type === "table") {
    return {
      type: "table",
      tableData: section.tableData ?? { headers: [], rows: [] },
      settings: section.settings,
    };
  }
  if (type === "faq") {
    return { type: "faq", faqs: section.faqs ?? [], settings: section.settings };
  }
  if (type === "cta") {
    return {
      type: "cta",
      content: section.content,
      settings: section.settings,
      ctas: (section.ctas ?? []).map((c) => ({
        label: c.label,
        link: c.link,
        variant: (c.variant === "outline"
          ? "outline"
          : c.variant === "secondary"
            ? "secondary"
            : "primary") as "primary" | "outline" | "secondary",
      })),
    };
  }
  if (type === "button") {
    return {
      type: "button",
      content: section.content,
      settings: section.settings,
      ctas: (section.ctas ?? []).map((c) => ({
        label: c.label,
        link: c.link,
        variant: (c.variant === "outline"
          ? "outline"
          : c.variant === "secondary"
            ? "secondary"
            : "primary") as "primary" | "outline" | "secondary",
      })),
    };
  }
  if (type === "gallery" || type === "video" || type === "callout" || type === "divider") {
    return {
      type,
      content: section.content,
      settings: section.settings,
      rawHtml: section.rawHtml,
    };
  }
  if (type === "quote") {
    return {
      type: "quote",
      content: section.content ?? section.body ?? "",
      settings: section.settings,
    };
  }
  return {
    type: "text",
    content: section.content ?? section.body ?? "",
    settings: section.settings,
  };
}

export function blogPostToCmsPayload(post: BlogPost) {
  const schemas = post.schemas ?? schemasFromLegacy(post.advancedSchema);
  const faqs =
    post.faqs?.length
      ? post.faqs
      : post.advancedSchema?.type === "faq"
        ? post.advancedSchema.faqs
        : undefined;
  const meta = normalizeBlogMeta({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    description: post.description,
    image: post.image,
    thumbnailImage: post.thumbnail,
    author: post.author,
    category: post.category,
    tags: post.tags,
    readTime: post.readTime,
    isFeatured: post.isFeatured,
    publishedAt: post.date,
    dateModified: post.dateModified,
    faqs,
    schemas,
    seo: post.seo,
    advancedSchema: post.advancedSchema,
  });
  const sections = post.sections.map(blogSectionToCms);
  return {
    pageKey: `blog/${post.slug}`,
    meta,
    sections,
    status: post.isPublished ? ("published" as const) : ("draft" as const),
  };
}

export function displayTitleFromPage(page: {
  pageKey: string;
  meta?: Partial<CmsBlogMeta> | null;
  sections?: { heading?: string; content?: string }[];
}): string {
  if (page.meta?.title) return page.meta.title;
  const first = page.sections?.[0];
  return first?.heading || first?.content?.slice(0, 60) || page.pageKey;
}

export function buildPageUrl(pageKey: string, mode: string): string {
  return `/dashboard/seo/blogs/build/${encodeURIComponent(pageKey)}?mode=${mode}`;
}
