"use client";

import { useRouter } from "next/navigation";
import { Code, LayoutGrid } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { buildPageUrl } from "@/lib/cms/blogCms";
import { BuilderHeader } from "./shared/BuilderHeader";
import type { BuilderPageData } from "./shared/saveBlog";

type BuildChoiceProps = {
  page: BuilderPageData;
};

export function BuildChoice({ page }: BuildChoiceProps) {
  const router = useRouter();
  const title = page.meta?.title ?? "Untitled";
  const slug = page.meta?.slug ?? page.pageKey.replace(/^blog\//, "");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BuilderHeader
        title={title}
        slug={slug}
        pageKey={page.pageKey}
        onSaveExit={() => router.push("/dashboard/seo/blogs")}
      />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push(buildPageUrl(page.pageKey, "manual"))}
            className="group border border-white/10 bg-white/[0.03] p-8 text-left transition-colors hover:border-[#EFCD62]/50 hover:bg-[#EFCD62]/5"
          >
            <LayoutGrid className="mb-4 h-10 w-10 text-[#EFCD62]" />
            <h2 className="font-philosopher text-2xl text-white group-hover:text-[#EFCD62]">
              Manual Builder
            </h2>
            <p className="mt-2 font-manrope text-sm text-white/55">
              Drag and drop pre-built blocks. Fast, structured, on-brand.
            </p>
          </button>
          <button
            type="button"
            onClick={() => router.push(buildPageUrl(page.pageKey, "html"))}
            className="group border border-white/10 bg-white/[0.03] p-8 text-left transition-colors hover:border-[#EFCD62]/50 hover:bg-[#EFCD62]/5"
          >
            <Code className="mb-4 h-10 w-10 text-[#EFCD62]" />
            <h2 className="font-philosopher text-2xl text-white group-hover:text-[#EFCD62]">
              HTML Tags Builder
            </h2>
            <p className="mt-2 font-manrope text-sm text-white/55">
              Write raw HTML or assemble it visually from individual tags. For
              advanced, fully custom layouts.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
