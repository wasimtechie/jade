"use client";

import { Suspense } from "react";
import { DebugPanel } from "@/components/dashboard/DebugPanel";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevDebugPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading debug panel…" />}>
      <DebugPanel />
    </Suspense>
  );
}
