"use client";

import { Suspense } from "react";
import { BookingsManager } from "@/components/dashboard/BookingsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function BookingRecordsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading booking records…" />}>
      <BookingsManager />
    </Suspense>
  );
}
