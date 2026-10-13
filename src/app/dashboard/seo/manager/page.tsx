"use client";

import { Suspense } from "react";
import { SeoManagerDashboard } from "@/components/dashboard/seo/SeoManagerDashboard";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";
import "@/styles/seo-manager.css";

export default function SeoManagerPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading SEO Manager…" />}>
      <SeoManagerDashboard />
    </Suspense>
  );
}
