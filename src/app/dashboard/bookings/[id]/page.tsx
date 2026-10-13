import { Suspense } from "react";
import { BookingFolio } from "@/components/dashboard/BookingFolio";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";

type PageProps = {
  params: { id: string };
};

export default function BookingFolioPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DashboardPageFallback label="Loading booking folio…" />}>
      <BookingFolio bookingId={params.id} />
    </Suspense>
  );
}
