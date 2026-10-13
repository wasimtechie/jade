"use client";

import { Suspense } from "react";
import { SitemapManager } from "@/components/dashboard/SitemapManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function SeoSitemapPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading sitemap…" />}>
      <SitemapManager />
    </Suspense>
  );
}
