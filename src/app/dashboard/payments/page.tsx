"use client";

import { Suspense } from "react";
import { PaymentsManager } from "@/components/dashboard/PaymentsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading payments…" />}>
      <PaymentsManager />
    </Suspense>
  );
}
