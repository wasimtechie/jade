import {
  SITE_ORIGIN,
  defaultCanonicalUrl,
  normalizeBlogMeta,
  resolvePostSchemas,
  type CmsBlogMeta,
  type CmsBlogSection,
} from "@/lib/cms/blogCmsMeta";
import { computeBlogSeoHealth } from "@/lib/cms/blogSeoHealth";
import { LANDING_TEMPLATES } from "@/lib/cms/landingTemplates";

export type SeoContentType = "blog" | "villa" | "landing" | "experience";

export type SeoIssuePriority = "high" | "medium" | "low";

export type SeoIssue = {
  id: string;
  contentType: SeoContentType;
  contentId: string;
  contentName: string;
  publicUrl: string;
  issueType: string;
  category:
    | "meta"
    | "og"
    | "canonical"
    | "schema"
    | "alt"
    | "duplicate"
    | "redirect"
    | "slug";
  priority: SeoIssuePriority;
  fixHref: string;
  lastModified?: string;
};

export type AuditedPage = {
  contentType: SeoContentType;
  contentId: string;
  contentName: string;
  publicUrl: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  focusKeyword: string;
  slug: string;
  schemas: {
    article: boolean;
    faq: boolean;
    howTo: boolean;
    breadcrumb: boolean;
  };
  score: number;
  lastModified?: string;
  fixHref: string;
};

const EXPERIENCE_PAGES = [
  { path: "/experiences", name: "Experiences Hub" },
  { path: "/weddings", name: "Weddings" },
  { path: "/corporate-retreats", name: "Corporate Retreats" },
  { path: "/weekend-getaways", name: "Weekend Getaways" },
  { path: "/party-villas", name: "Party Villas" },
];

export function scorePage(input: {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  ogImage: string;
  focusKeyword: string;
  slug: string;
  schemas?: { article?: boolean; faq?: boolean };
  hasFaqContent?: boolean;
  missingAlt?: boolean;
}): number {
  let score = 100;
  if (!input.metaTitle.trim()) score -= 20;
  else if (input.metaTitle.length > 60) score -= 5;
  if (!input.metaDescription.trim()) score -= 15;
  else if (input.metaDescription.length > 160) score -= 5;
  if (!input.canonical.trim()) score -= 10;
  if (!input.ogImage.trim()) score -= 10;
  if (!input.focusKeyword.trim()) score -= 5;
  if (!input.slug.trim() || input.slug.length < 3) score -= 5;
  if (input.schemas?.faq && !input.hasFaqContent) score -= 10;
  if (input.missingAlt) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function issue(
  partial: Omit<SeoIssue, "id"> & { id?: string },
): SeoIssue {
  return {
    id: partial.id ?? `${partial.contentId}:${partial.issueType}`,
    ...partial,
  };
}

export function auditBlogPage(doc: {
  pageKey: string;
  status?: string;
  meta?: CmsBlogMeta | null;
  sections?: CmsBlogSection[];
  updatedAt?: Date | string;
}): { page: AuditedPage; issues: SeoIssue[] } {
  const meta = normalizeBlogMeta(doc.meta);
  const slug = meta.slug || doc.pageKey.replace(/^blog\//, "");
  const publicUrl = `${SITE_ORIGIN}/${slug}/`;
  const seo = meta.seo ?? {};
  const schemas = resolvePostSchemas({ schemas: meta.schemas, advancedSchema: meta.advancedSchema });
  const health = computeBlogSeoHealth(meta, doc.sections ?? [], doc.status);
  const lastModified =
    doc.updatedAt != null ? new Date(doc.updatedAt).toISOString() : undefined;

  const page: AuditedPage = {
    contentType: "blog",
    contentId: doc.pageKey,
    contentName: meta.title || slug,
    publicUrl,
    status: doc.status ?? "draft",
    metaTitle: seo.metaTitle || meta.title,
    metaDescription: meta.description || meta.excerpt,
    canonical: seo.canonicalUrl || defaultCanonicalUrl(slug),
    ogTitle: seo.ogTitle || seo.metaTitle || meta.title,
    ogDescription: seo.ogDescription || meta.description,
    ogImage: seo.ogImage || meta.image || meta.thumbnailImage || "",
    focusKeyword: seo.focusKeyword || "",
    slug,
    schemas,
    score: health.score,
    lastModified,
    fixHref: `/dashboard/seo/blogs?edit=${encodeURIComponent(doc.pageKey)}`,
  };

  const issues: SeoIssue[] = health.issues.map((h) =>
    issue({
      contentType: "blog",
      contentId: doc.pageKey,
      contentName: page.contentName,
      publicUrl,
      issueType: h.label,
      category:
        h.id.includes("alt")
          ? "alt"
          : h.id.includes("faq") || h.id.includes("schema")
            ? "schema"
            : h.id.includes("image")
              ? "og"
              : "meta",
      priority: h.severity === "error" ? "high" : "medium",
      fixHref: page.fixHref,
      lastModified,
    }),
  );

  if (!seo.canonicalUrl?.trim()) {
    issues.push(
      issue({
        contentType: "blog",
        contentId: doc.pageKey,
        contentName: page.contentName,
        publicUrl,
        issueType: "Missing canonical URL",
        category: "canonical",
        priority: "medium",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }

  return { page, issues };
}

export function auditVilla(doc: {
  slug: string;
  name: string;
  thumbnail?: string;
  content?: {
    description?: string;
    images?: string[];
    faq?: { question: string; answer: string }[];
  };
  updatedAt?: Date | string;
}): { page: AuditedPage; issues: SeoIssue[] } {
  const publicUrl = `${SITE_ORIGIN}/retreat/${doc.slug}/`;
  const lastModified =
    doc.updatedAt != null ? new Date(doc.updatedAt).toISOString() : undefined;
  const metaTitle = doc.name;
  const metaDescription = doc.content?.description?.slice(0, 320) ?? "";
  const ogImage = doc.thumbnail ?? "";

  const page: AuditedPage = {
    contentType: "villa",
    contentId: doc.slug,
    contentName: doc.name,
    publicUrl,
    status: "published",
    metaTitle,
    metaDescription,
    canonical: publicUrl,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage,
    focusKeyword: "",
    slug: doc.slug,
    schemas: { article: false, faq: Boolean(doc.content?.faq?.length), howTo: false, breadcrumb: true },
    score: scorePage({
      metaTitle,
      metaDescription,
      canonical: publicUrl,
      ogImage,
      focusKeyword: "",
      slug: doc.slug,
      hasFaqContent: Boolean(doc.content?.faq?.length),
      missingAlt: Boolean(ogImage && !doc.name),
    }),
    lastModified,
    fixHref: `/dashboard/settings/villas`,
  };

  const issues: SeoIssue[] = [];
  if (!metaDescription.trim()) {
    issues.push(
      issue({
        contentType: "villa",
        contentId: doc.slug,
        contentName: doc.name,
        publicUrl,
        issueType: "Missing meta description",
        category: "meta",
        priority: "medium",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }
  if (!ogImage.trim()) {
    issues.push(
      issue({
        contentType: "villa",
        contentId: doc.slug,
        contentName: doc.name,
        publicUrl,
        issueType: "Missing OG image",
        category: "og",
        priority: "medium",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }
  if (doc.content?.images?.some((img) => img && !img.includes("alt="))) {
    issues.push(
      issue({
        contentType: "villa",
        contentId: doc.slug,
        contentName: doc.name,
        publicUrl,
        issueType: "Gallery images may lack alt text",
        category: "alt",
        priority: "low",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }

  return { page, issues };
}

export function auditLandingPage(
  pageKey: string,
  doc?: {
    meta?: { title?: string; description?: string; image?: string; seo?: Record<string, string> };
    status?: string;
    updatedAt?: Date | string;
  } | null,
): { page: AuditedPage; issues: SeoIssue[] } {
  const template = LANDING_TEMPLATES[pageKey];
  const path = template?.path ?? `/${pageKey.replace(/^landing\//, "")}`;
  const publicUrl = `${SITE_ORIGIN}${path}`;
  const title = doc?.meta?.title || template?.label || pageKey;
  const description = doc?.meta?.description ?? "";
  const ogImage = doc?.meta?.image ?? doc?.meta?.seo?.ogImage ?? "";
  const lastModified =
    doc?.updatedAt != null ? new Date(doc.updatedAt).toISOString() : undefined;

  const page: AuditedPage = {
    contentType: "landing",
    contentId: pageKey,
    contentName: title,
    publicUrl,
    status: doc?.status ?? "published",
    metaTitle: doc?.meta?.seo?.metaTitle || title,
    metaDescription: description,
    canonical: doc?.meta?.seo?.canonicalUrl || publicUrl,
    ogTitle: doc?.meta?.seo?.ogTitle || title,
    ogDescription: doc?.meta?.seo?.ogDescription || description,
    ogImage,
    focusKeyword: doc?.meta?.seo?.focusKeyword ?? "",
    slug: path.replace(/^\//, ""),
    schemas: { article: false, faq: false, howTo: false, breadcrumb: true },
    score: scorePage({
      metaTitle: title,
      metaDescription: description,
      canonical: publicUrl,
      ogImage,
      focusKeyword: "",
      slug: path,
    }),
    lastModified,
    fixHref: `/dashboard/seo/landing-pages/build/${encodeURIComponent(pageKey)}`,
  };

  const issues: SeoIssue[] = [];
  if (!page.metaTitle.trim()) {
    issues.push(
      issue({
        contentType: "landing",
        contentId: pageKey,
        contentName: title,
        publicUrl,
        issueType: "Missing meta title",
        category: "meta",
        priority: "high",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }
  if (!page.metaDescription.trim()) {
    issues.push(
      issue({
        contentType: "landing",
        contentId: pageKey,
        contentName: title,
        publicUrl,
        issueType: "Missing meta description",
        category: "meta",
        priority: "medium",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }
  if (!ogImage.trim()) {
    issues.push(
      issue({
        contentType: "landing",
        contentId: pageKey,
        contentName: title,
        publicUrl,
        issueType: "Missing OG image",
        category: "og",
        priority: "medium",
        fixHref: page.fixHref,
        lastModified,
      }),
    );
  }

  return { page, issues };
}

export function auditExperienceStatic(exp: {
  path: string;
  name: string;
}): { page: AuditedPage; issues: SeoIssue[] } {
  const publicUrl = `${SITE_ORIGIN}${exp.path}`;
  const pageKey = `landing${exp.path.replace(/\//g, "-") || "/experiences"}`;

  const page: AuditedPage = {
    contentType: "experience",
    contentId: exp.path,
    contentName: exp.name,
    publicUrl,
    status: "published",
    metaTitle: exp.name,
    metaDescription: "",
    canonical: publicUrl,
    ogTitle: exp.name,
    ogDescription: "",
    ogImage: "",
    focusKeyword: "",
    slug: exp.path.replace(/^\//, ""),
    schemas: { article: false, faq: false, howTo: false, breadcrumb: true },
    score: 70,
    fixHref: `/dashboard/seo/landing-pages`,
  };

  return {
    page,
    issues: [
      issue({
        contentType: "experience",
        contentId: exp.path,
        contentName: exp.name,
        publicUrl,
        issueType: "Review meta description in landing CMS",
        category: "meta",
        priority: "low",
        fixHref: page.fixHref,
      }),
    ],
  };
}

export function detectDuplicates(pages: AuditedPage[]): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const byField = (field: keyof AuditedPage, label: string, category: SeoIssue["category"]) => {
    const map = new Map<string, AuditedPage[]>();
    for (const p of pages) {
      const val = String(p[field] ?? "")
        .trim()
        .toLowerCase();
      if (!val) continue;
      const list = map.get(val) ?? [];
      list.push(p);
      map.set(val, list);
    }
    for (const [, group] of Array.from(map.entries())) {
      if (group.length < 2) continue;
      for (const p of group) {
        issues.push(
          issue({
            contentType: p.contentType,
            contentId: p.contentId,
            contentName: p.contentName,
            publicUrl: p.publicUrl,
            issueType: `Duplicate ${label}`,
            category,
            priority: "high",
            fixHref: p.fixHref,
            lastModified: p.lastModified,
          }),
        );
      }
    }
  };

  byField("slug", "slug", "slug");
  byField("metaTitle", "meta title", "duplicate");
  byField("metaDescription", "meta description", "duplicate");
  byField("canonical", "canonical URL", "canonical");

  return issues;
}

export { EXPERIENCE_PAGES };
