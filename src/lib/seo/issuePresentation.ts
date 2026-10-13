import type { SeoContentType, SeoIssue, SeoIssuePriority } from "@/lib/seo/seoAudit";

export type SeoIssueView = SeoIssue;

export type ContentIssueGroup = {
  key: string;
  contentId: string;
  contentName: string;
  contentType: SeoContentType;
  publicUrl: string;
  fixHref: string;
  lastModified?: string;
  issues: SeoIssueView[];
  highestPriority: SeoIssuePriority;
  score?: number;
};

const PRIORITY_RANK: Record<SeoIssuePriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function highestPriority(
  issues: { priority: SeoIssuePriority }[],
): SeoIssuePriority {
  if (!issues.length) return "low";
  return issues.reduce<SeoIssuePriority>(
    (best, i) =>
      PRIORITY_RANK[i.priority] > PRIORITY_RANK[best] ? i.priority : best,
    "low",
  );
}

export function groupIssuesByContent(
  issues: SeoIssueView[],
  scores?: Map<string, number>,
): ContentIssueGroup[] {
  const map = new Map<string, ContentIssueGroup>();

  for (const issue of issues) {
    const key = issue.contentId || `${issue.contentType}:${issue.contentName}`;
    const existing = map.get(key);
    if (existing) {
      existing.issues.push(issue);
      existing.highestPriority = highestPriority(existing.issues);
      if (issue.lastModified && (!existing.lastModified || issue.lastModified > existing.lastModified)) {
        existing.lastModified = issue.lastModified;
      }
    } else {
      map.set(key, {
        key,
        contentId: issue.contentId,
        contentName: issue.contentName,
        contentType: issue.contentType,
        publicUrl: issue.publicUrl,
        fixHref: issue.fixHref,
        lastModified: issue.lastModified,
        issues: [issue],
        highestPriority: issue.priority,
        score: scores?.get(key),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const pr =
      PRIORITY_RANK[b.highestPriority] - PRIORITY_RANK[a.highestPriority];
    if (pr !== 0) return pr;
    return b.issues.length - a.issues.length;
  });
}

export const CATEGORY_META: Record<
  SeoIssue["category"],
  { label: string; tone: "danger" | "warning" | "info" | "neutral" }
> = {
  meta: { label: "Meta", tone: "warning" },
  og: { label: "OG / Image", tone: "warning" },
  canonical: { label: "Canonical", tone: "info" },
  schema: { label: "Schema", tone: "info" },
  alt: { label: "Alt text", tone: "warning" },
  duplicate: { label: "Duplicate", tone: "danger" },
  redirect: { label: "Redirect", tone: "danger" },
  slug: { label: "Slug", tone: "danger" },
};

export const PRIORITY_META: Record<
  SeoIssuePriority,
  { label: string; tone: "danger" | "warning" | "neutral" }
> = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "neutral" },
};

export const CONTENT_TYPE_LABEL: Record<SeoContentType, string> = {
  blog: "Blog",
  villa: "Villa",
  landing: "Landing",
  experience: "Experience",
};

/** Actionable hint shown under each issue in the accordion. */
export function fixHintForIssue(issue: SeoIssueView): string {
  const t = issue.issueType.toLowerCase();
  if (t.includes("meta title")) {
    return "Add a unique title (50–60 characters) in the SEO panel.";
  }
  if (t.includes("meta description")) {
    return "Write a compelling description (140–160 characters).";
  }
  if (t.includes("canonical")) {
    return "Set the canonical URL to the preferred indexable URL.";
  }
  if (t.includes("featured image") || t.includes("og")) {
    return "Upload a hero or OG image (1200×630 recommended).";
  }
  if (t.includes("focus keyword")) {
    return "Define the primary keyword you want this page to rank for.";
  }
  if (t.includes("alt")) {
    return "Add descriptive alt text for accessibility and image SEO.";
  }
  if (t.includes("schema") || t.includes("faq")) {
    return "Enable or complete structured data in the Schema tab.";
  }
  if (t.includes("duplicate")) {
    return "Make this value unique across published pages.";
  }
  if (t.includes("redirect")) {
    return "Fix the redirect target or remove conflicting rules.";
  }
  if (t.includes("slug")) {
    return "Use a unique, readable URL slug for this content.";
  }
  return "Open the editor and resolve this field before publishing.";
}

export function scoreTone(score: number): "ok" | "warn" | "bad" {
  if (score >= 80) return "ok";
  if (score >= 50) return "warn";
  return "bad";
}

export function validateRobotsTxt(content: string): string[] {
  const errors: string[] = [];
  const lines = content.split(/\r?\n/);
  let hasUserAgent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      hasUserAgent = true;
      if (!line.slice(11).trim()) {
        errors.push(`Line ${i + 1}: User-agent value is empty.`);
      }
    }
    if (lower.startsWith("disallow:") && !line.slice(9).trim()) {
      errors.push(`Line ${i + 1}: Disallow with empty path blocks entire site.`);
    }
    if (lower.startsWith("sitemap:") && !/^https?:\/\//i.test(line.slice(8).trim())) {
      errors.push(`Line ${i + 1}: Sitemap URL should be absolute (https://…).`);
    }
  }

  if (content.trim() && !hasUserAgent) {
    errors.push("Add at least one User-agent directive.");
  }

  return errors;
}
