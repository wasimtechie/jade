"use client";

import { Suspense } from "react";
import { CareersManager } from "@/components/dashboard/CareersManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function CareersPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading careers…" />}>
      <CareersManager />
    </Suspense>
  );
}
