"use client";

import { Suspense } from "react";
import { RolesPermissionsManager } from "@/components/dashboard/RolesPermissionsManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function RolesPermissionsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading roles…" />}>
      <RolesPermissionsManager />
    </Suspense>
  );
}
