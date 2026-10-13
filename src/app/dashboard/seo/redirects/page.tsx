"use client";

import { Suspense } from "react";
import { RedirectManager } from "@/components/dashboard/seo/RedirectManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function RedirectsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading redirects…" />}>
      <RedirectManager />
    </Suspense>
  );
}
