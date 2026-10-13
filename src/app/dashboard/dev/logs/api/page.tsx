"use client";

import { Suspense } from "react";
import { AuditLogsViewer } from "@/components/dashboard/AuditLogsViewer";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevApiLogsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading API logs…" />}>
      <AuditLogsViewer
        endpoint="/api/dashboard/dev/logs/api"
        emptyMessage="No audit entries yet."
      />
    </Suspense>
  );
}
