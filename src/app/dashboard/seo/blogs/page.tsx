"use client";

import { Suspense } from "react";
import { BlogPagesManager } from "@/components/dashboard/BlogPagesManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function SeoBlogsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading blogs…" />}>
      <BlogPagesManager />
    </Suspense>
  );
}
