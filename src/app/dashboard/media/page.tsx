"use client";

import { Suspense } from "react";
import { MediaLibraryManager } from "@/components/dashboard/MediaLibraryManager";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";
import "@/styles/media-library.css";

export default function MediaLibraryPage() {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading media library…" />}>
      <MediaLibraryManager />
    </Suspense>
  );
}
