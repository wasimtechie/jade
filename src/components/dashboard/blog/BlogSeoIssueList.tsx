"use client";

import type { SeoHealthIssue } from "@/lib/cms/blogSeoHealth";
import { DashboardStatusBadge } from "../ui/DashboardStatusBadge";

const FIX_LABEL: Record<string, string> = {
  seo: "SEO tab",
  schema: "Schema tab",
  faq: "FAQ tab",
  details: "Details tab",
};

export function BlogSeoIssueList({ issues }: { issues: SeoHealthIssue[] }) {
  if (!issues.length) {
    return (
      <p className="blog-seo-expand__ok">
        All SEO checks passed for this post.
      </p>
    );
  }

  return (
    <ul className="blog-seo-expand__list">
      {issues.map((issue) => (
        <li key={issue.id} className="blog-seo-expand__item">
          <DashboardStatusBadge
            tone={issue.severity === "error" ? "danger" : "warning"}
          >
            {issue.severity === "error" ? "High" : "Medium"}
          </DashboardStatusBadge>
          <span className="blog-seo-expand__label">{issue.label}</span>
          {issue.fixStep && (
            <span className="blog-seo-expand__hint">
              Fix in {FIX_LABEL[issue.fixStep] ?? issue.fixStep}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
