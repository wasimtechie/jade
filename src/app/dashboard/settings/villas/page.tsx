"use client";

import { Suspense } from "react";
import { VillaSettingsManager } from "@/components/dashboard/VillaSettingsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function VillaSettingsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading villa settings…" />}>
      <VillaSettingsManager />
    </Suspense>
  );
}
