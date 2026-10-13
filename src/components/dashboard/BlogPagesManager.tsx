"use client";

import { Suspense } from "react";
import { BlogListDashboard } from "@/components/dashboard/blog/BlogListDashboard";

export function BlogPagesManager() {
  return (
    <Suspense fallback={<p className="text-white/50">Loading blogs…</p>}>
      <BlogListDashboard />
    </Suspense>
  );
}
