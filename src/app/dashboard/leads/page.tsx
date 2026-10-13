"use client";

import { Suspense } from "react";
import { LeadsManager } from "@/components/dashboard/LeadsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function LeadsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading leads…" />}>
      <LeadsManager />
    </Suspense>
  );
}
