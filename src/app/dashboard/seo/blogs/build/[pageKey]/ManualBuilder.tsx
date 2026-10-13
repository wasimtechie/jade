"use client";

import type { BuilderPageData } from "./shared/saveBlog";
import { DocumentEditor } from "@/components/dashboard/blog/editor/DocumentEditor";

type ManualBuilderProps = {
  page: BuilderPageData;
};

/** Notion-style document editor for blog content blocks. */
export function ManualBuilder({ page }: ManualBuilderProps) {
  return <DocumentEditor page={page} />;
}
