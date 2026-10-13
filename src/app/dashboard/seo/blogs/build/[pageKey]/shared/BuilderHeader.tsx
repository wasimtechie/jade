"use client";

import Link from "next/link";
import { dash } from "@/lib/dashboard/dashboardClasses";

type BuilderHeaderProps = {
  title: string;
  slug: string;
  pageKey: string;
  onSaveExit: () => void;
  saving?: boolean;
};

export function BuilderHeader({
  title,
  slug,
  pageKey,
  onSaveExit,
  saving = false,
}: BuilderHeaderProps) {
  const editHref = `/dashboard/seo/blogs?edit=${encodeURIComponent(pageKey)}`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1a1c1e]/95 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="min-w-0">
          <Link
            href={editHref}
            className="font-manrope text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#EFCD62]"
          >
            ← Back to details
          </Link>
          <h1 className="mt-1 truncate font-philosopher text-xl text-white">
            {title || "Untitled blog"}
          </h1>
          <p className="font-mono text-xs text-white/40">/{slug}/</p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={onSaveExit}
          className={`${dash.btn} ${dash.btnText}`}
        >
          {saving ? "Saving…" : "Save & exit"}
        </button>
      </div>
    </header>
  );
}
