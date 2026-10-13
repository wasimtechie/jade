"use client";

import { Suspense } from "react";
import { AxisRoomsSettings } from "@/components/dashboard/AxisRoomsSettings";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function AxisRoomsSettingsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading Axis Rooms…" />}>
      <AxisRoomsSettings />
    </Suspense>
  );
}
