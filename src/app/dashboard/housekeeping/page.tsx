import { Suspense } from "react";
import { HousekeepingBoard } from "@/components/dashboard/HousekeepingBoard";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export const dynamic = "force-dynamic";

export default function HousekeepingPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading housekeeping…" />}>
      <HousekeepingBoard />
    </Suspense>
  );
}
