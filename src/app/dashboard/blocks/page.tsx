import { Suspense } from "react";
import { BlocksManager } from "@/components/dashboard/BlocksManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

export const dynamic = "force-dynamic";

export default function BlocksPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading blocks…" />}>
      <BlocksManager />
    </Suspense>
  );
}
