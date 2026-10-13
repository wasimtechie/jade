import type { CmsBlogMeta, CmsBlogSection } from "@/lib/cms/blogCmsMeta";
import { resolvePostSchemas } from "@/lib/cms/blogCmsMeta";

export type SeoHealthIssue = {
  id: string;
  label: string;
  severity: "warning" | "error";
  fixStep?: "seo" | "schema" | "faq" | "details";
};

export type SeoHealthResult = {
  score: number;
  complete: boolean;
  issues: SeoHealthIssue[];
};

export function computeBlogSeoHealth(
  meta: Partial<CmsBlogMeta> | null | undefined,
  sections: CmsBlogSection[] = [],
  status?: string,
): SeoHealthResult {
  const issues: SeoHealthIssue[] = [];
  const m = meta ?? {};
  const seo = m.seo ?? {};

  if (!seo.metaTitle?.trim() && !m.title?.trim()) {
    issues.push({
      id: "meta-title",
      label: "Missing meta title",
      severity: "error",
      fixStep: "seo",
    });
  }
  if (!m.description?.trim() && !m.excerpt?.trim() && !seo.ogDescription?.trim()) {
    issues.push({
      id: "meta-desc",
      label: "Missing meta description",
      severity: "warning",
      fixStep: "seo",
    });
  }
  if (!m.image?.trim() && !m.thumbnailImage?.trim()) {
    issues.push({
      id: "featured-image",
      label: "Missing featured image",
      severity: "warning",
      fixStep: "details",
    });
  }
  if (!seo.focusKeyword?.trim()) {
    issues.push({
      id: "focus-keyword",
      label: "Missing focus keyword",
      severity: "warning",
      fixStep: "seo",
    });
  }

  const schemas = resolvePostSchemas({
    schemas: m.schemas,
    advancedSchema: m.advancedSchema,
  });
  if (schemas.faq && !(m.faqs?.length || sections.some((s) => s.type === "faq" && s.faqs?.length))) {
    issues.push({
      id: "faq-schema",
      label: "FAQ schema enabled but no FAQs",
      severity: "warning",
      fixStep: "faq",
    });
  }

  const hasImageWithoutAlt = sections.some(
    (s) =>
      s.type === "image" &&
      s.image &&
      !(s.caption?.trim() || (s.settings as { alt?: string } | undefined)?.alt),
  );
  if (hasImageWithoutAlt) {
    issues.push({
      id: "alt-text",
      label: "Image blocks missing alt text",
      severity: "warning",
      fixStep: "details",
    });
  }

  if (status === "published" && seo.robotsIndex === false) {
    issues.push({
      id: "noindex",
      label: "Published but set to noindex",
      severity: "warning",
      fixStep: "seo",
    });
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 25 - warnCount * 10);

  return {
    score,
    complete: issues.length === 0,
    issues,
  };
}

export function seoScoreBucket(score: number): "good" | "fair" | "poor" {
  if (score >= 80) return "good";
  if (score >= 50) return "fair";
  return "poor";
}
