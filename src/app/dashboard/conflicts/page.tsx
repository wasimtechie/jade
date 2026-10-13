"use client";

import { Suspense } from "react";
import { ConflictsManager } from "@/components/dashboard/ConflictsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function ConflictsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading conflicts…" />}>
      <ConflictsManager />
    </Suspense>
  );
}
