import { Suspense } from "react";
import { CalendarPage } from "@/components/dashboard/CalendarPage";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export default function DashboardHomePage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading calendar…" />}>
      <CalendarPage />
    </Suspense>
  );
}
