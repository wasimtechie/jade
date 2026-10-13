"use client";

import { Suspense } from "react";
import { SystemConfigViewer } from "@/components/dashboard/SystemConfigViewer";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevSystemPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading system config…" />}>
      <SystemConfigViewer />
    </Suspense>
  );
}
