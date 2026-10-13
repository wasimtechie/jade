import { Suspense } from "react";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export const dynamic = "force-dynamic";

export default function StaffPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading staff…" />}>
      <UserManagement />
    </Suspense>
  );
}
