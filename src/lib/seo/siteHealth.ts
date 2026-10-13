import { connectDB } from "@/lib/db";
import { ContentPageModel } from "@/models/ContentPage";
import { VillaModel } from "@/models/Villa";
import { MediaAssetModel } from "@/models/MediaAsset";
import { SeoRedirectModel } from "@/models/SeoRedirect";
import { SeoSiteSettingsModel } from "@/models/SeoSiteSettings";
import { LANDING_TEMPLATES } from "@/lib/cms/landingTemplates";
import {
  auditBlogPage,
  auditLandingPage,
  auditVilla,
  detectDuplicates,
  EXPERIENCE_PAGES,
  type AuditedPage,
  type SeoIssue,
} from "@/lib/seo/seoAudit";
import { testRedirect } from "@/lib/seo/redirectService";
import { getSeoSiteSettings } from "@/lib/seo/seoSiteSettings";

export { getSeoSiteSettings };

export type SiteHealthReport = {
  generatedAt: string;
  seoHealthScore: number;
  contentHealthScore: number;
  mediaHealthScore: number;
  redirectHealthScore: number;
  schemaHealthScore: number;
  summary: {
    totalIndexedPages: number;
    totalPublishedPages: number;
    missingMetaTitles: number;
    missingMetaDescriptions: number;
    missingOgImages: number;
    missingAltText: number;
    missingSchema: number;
    brokenRedirects: number;
    duplicateSlugs: number;
    openIssues: number;
  };
  pages: AuditedPage[];
  issues: SeoIssue[];
  mediaIssues: SeoIssue[];
  redirectIssues: SeoIssue[];
  recentFixes: { action: string; at: string }[];
};

function avg(nums: number[]) {
  if (!nums.length) return 100;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export async function runSiteSeoAudit(): Promise<SiteHealthReport> {
  await connectDB();

  const pages: AuditedPage[] = [];
  const issues: SeoIssue[] = [];

  const blogs = await ContentPageModel.find({ pageKey: /^blog\// })
    .select("pageKey status meta sections updatedAt")
    .lean();
  for (const b of blogs) {
    const result = auditBlogPage(b as Parameters<typeof auditBlogPage>[0]);
    pages.push(result.page);
    issues.push(...result.issues);
  }

  const landingKeys = Object.keys(LANDING_TEMPLATES);
  const landingDocs = await ContentPageModel.find({
    pageKey: { $in: landingKeys },
  })
    .select("pageKey status meta updatedAt")
    .lean();
  const landingMap = new Map(
    landingDocs.map((d) => [(d as { pageKey: string }).pageKey, d]),
  );
  for (const key of landingKeys) {
    const result = auditLandingPage(
      key,
      landingMap.get(key) as Parameters<typeof auditLandingPage>[1],
    );
    pages.push(result.page);
    issues.push(...result.issues);
  }

  const villas = await VillaModel.find({
    isDeleted: false,
    status: { $ne: "hidden" },
  })
    .select("slug name thumbnail content updatedAt")
    .lean();
  for (const v of villas) {
    const result = auditVilla(v as Parameters<typeof auditVilla>[0]);
    pages.push(result.page);
    issues.push(...result.issues);
  }

  issues.push(...detectDuplicates(pages));

  const publishedPages = pages.filter((p) =>
    ["published", "active"].includes(p.status),
  );

  const mediaMissingAlt = await MediaAssetModel.countDocuments({
    status: "active",
    storage: "gridfs",
    $or: [{ alt: "" }, { alt: { $exists: false } }],
  });
  const mediaIssues: SeoIssue[] = [];
  if (mediaMissingAlt > 0) {
    mediaIssues.push({
      id: "media:missing-alt",
      contentType: "blog",
      contentId: "media-library",
      contentName: "Media Library",
      publicUrl: "/dashboard/media",
      issueType: `${mediaMissingAlt} images missing alt text`,
      category: "alt",
      priority: "medium",
      fixHref: "/dashboard/media",
    });
  }

  const redirects = await SeoRedirectModel.find({ status: "active" }).lean();
  const redirectIssues: SeoIssue[] = [];
  let brokenRedirects = 0;
  for (const r of redirects) {
    const test = await testRedirect(
      (r as { fromPath: string }).fromPath,
      (r as { toPath: string }).toPath,
      redirects as { fromPath: string; toPath: string }[],
    );
    if (test.status !== "active") {
      brokenRedirects += 1;
      redirectIssues.push({
        id: `redirect:${(r as { _id: { toString(): string } })._id}`,
        contentType: "blog",
        contentId: (r as { fromPath: string }).fromPath,
        contentName: `${(r as { fromPath: string }).fromPath} → ${(r as { toPath: string }).toPath}`,
        publicUrl: (r as { fromPath: string }).fromPath,
        issueType: `Redirect ${test.status}`,
        category: "redirect",
        priority: "high",
        fixHref: "/dashboard/seo/redirects",
      });
    }
  }

  const schemaIssues = issues.filter((i) => i.category === "schema").length;
  const duplicateSlugs = issues.filter((i) => i.category === "slug").length;

  const summary = {
    totalIndexedPages: publishedPages.length,
    totalPublishedPages: publishedPages.length,
    missingMetaTitles: issues.filter((i) => i.issueType.toLowerCase().includes("meta title")).length,
    missingMetaDescriptions: issues.filter((i) =>
      i.issueType.toLowerCase().includes("meta description"),
    ).length,
    missingOgImages: issues.filter((i) =>
      i.issueType.toLowerCase().includes("og") || i.issueType.toLowerCase().includes("featured image"),
    ).length,
    missingAltText: issues.filter((i) => i.category === "alt").length + mediaMissingAlt,
    missingSchema: schemaIssues,
    brokenRedirects,
    duplicateSlugs,
    openIssues: issues.length + mediaIssues.length + redirectIssues.length,
  };

  const seoHealthScore = avg(pages.map((p) => p.score));
  const contentHealthScore = avg(
    pages.filter((p) => p.contentType !== "villa").map((p) => p.score),
  );
  const mediaHealthScore = mediaMissingAlt === 0 ? 100 : Math.max(0, 100 - mediaMissingAlt * 2);
  const redirectHealthScore =
    redirects.length === 0
      ? 100
      : Math.round(((redirects.length - brokenRedirects) / redirects.length) * 100);
  const schemaHealthScore =
    schemaIssues === 0 ? 100 : Math.max(0, 100 - schemaIssues * 8);

  await SeoSiteSettingsModel.updateOne(
    { key: "default" },
    {
      $set: {
        sitemapLastGeneratedAt: new Date(),
        sitemapUrlCount: publishedPages.length + EXPERIENCE_PAGES.length,
      },
    },
    { upsert: true },
  );

  return {
    generatedAt: new Date().toISOString(),
    seoHealthScore,
    contentHealthScore,
    mediaHealthScore,
    redirectHealthScore,
    schemaHealthScore,
    summary,
    pages,
    issues: [...issues, ...mediaIssues, ...redirectIssues],
    mediaIssues,
    redirectIssues,
    recentFixes: [],
  };
}
