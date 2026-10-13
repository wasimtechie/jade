"use client";

import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function SeoAnalyticsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading analytics…" />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
