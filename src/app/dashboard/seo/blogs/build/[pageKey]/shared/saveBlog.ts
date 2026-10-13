"use client";

import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import type { CmsBlogMeta, CmsBlogSection } from "@/lib/cms/blogCms";

export type BuilderPageData = {
  pageKey: string;
  status: "draft" | "published" | "scheduled";
  meta?: CmsBlogMeta | null;
  sections: CmsBlogSection[];
};

export async function saveBlogSections(
  page: BuilderPageData,
  sections: CmsBlogSection[],
): Promise<void> {
  const res = await dashboardFetch("/api/dashboard/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageKey: page.pageKey, sections }),
  });
  if (!res.ok) throw new Error("Failed to save sections");
}

export async function saveBlogDraft(
  page: BuilderPageData,
  sections: CmsBlogSection[],
): Promise<void> {
  await saveBlogSections(page, sections);
}

export async function saveAndPublishBlog(
  page: BuilderPageData,
  sections: CmsBlogSection[],
): Promise<void> {
  await saveBlogSections(page, sections);
  const res = await dashboardFetch("/api/dashboard/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageKey: page.pageKey, publish: true }),
  });
  if (!res.ok) throw new Error("Failed to publish");
}

export async function saveBlogExit(
  page: BuilderPageData,
  sections: CmsBlogSection[],
): Promise<void> {
  await saveBlogDraft(page, sections);
}
