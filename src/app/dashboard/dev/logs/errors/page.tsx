"use client";

import { Suspense } from "react";
import { AuditLogsViewer } from "@/components/dashboard/AuditLogsViewer";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevErrorLogsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading error logs…" />}>
      <AuditLogsViewer
        endpoint="/api/dashboard/dev/logs/errors"
        emptyMessage="No error-tagged audit entries yet."
        actionFilter="errors"
      />
    </Suspense>
  );
}
