"use client";

import { Suspense } from "react";
import { DatabaseExplorer } from "@/components/dashboard/DatabaseExplorer";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevDatabasePage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading database explorer…" />}>
      <DatabaseExplorer />
    </Suspense>
  );
}
