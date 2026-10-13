"use client";

import { Suspense } from "react";
import { WebhookLogsManager } from "@/components/dashboard/WebhookLogsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DevWebhookLogsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading webhook logs…" />}>
      <WebhookLogsManager />
    </Suspense>
  );
}
