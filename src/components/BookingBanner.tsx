"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { formatBookingCalendarDate } from "@/lib/bookingUiDates";

export default function BookingBanner({ onSearch }: { onSearch?: () => void }) {
  const { dateRange, guests } = useBooking();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to format the date
  const formatDateRange = () => {
    if (!mounted) return "Add Dates"; // Render consistently on server
    if (!dateRange.checkIn && !dateRange.checkOut) return "Add Dates";

    const inStr = formatBookingCalendarDate(dateRange.checkIn);
    const outStr = formatBookingCalendarDate(dateRange.checkOut);

    if (inStr && outStr) return `${inStr} - ${outStr}`;
    if (inStr) return `${inStr} - Add Checkout`;
    return "Add Dates";
  };

  // Helper to format guests
  const formatGuests = () => {
    if (!mounted) return "Add Guests"; // Render consistently on server
    const total = guests.adults + guests.children;
    if (total === 0) return "Add Guests";
    return `${total} Guest${total !== 1 ? "s" : ""}`;
  };

  return (
    <div className="w-full sm:w-fit bg-[#1A1C1E]/40 backdrop-blur-md border border-white/10 px-3 sm:px-4 py-1.5 sm:py-1 rounded-none flex flex-nowrap items-center justify-center sm:justify-start gap-x-2 sm:gap-x-5">
      <Link
        href="/book?step=dates"
        className="flex-none transition-all hover:opacity-80 py-1"
      >
        <div className="flex items-center gap-1 flex-none">
          <p className="text-[10px] text-white/50 font-manrope font-bold tracking-[0.15em] uppercase whitespace-nowrap">
            CHECK IN - CHECK OUT :
          </p>
          <p className="text-[12px] text-white font-manrope whitespace-nowrap">
            {formatDateRange()}
          </p>
        </div>
      </Link>

      <div className="block w-[1px] h-3 sm:h-4 bg-white/10 shrink-0 mx-0.5 sm:mx-0" />

      <div className="flex items-center gap-2 sm:gap-5 lg:gap-8 shrink-0">
        <Link
          href="/book?step=guests"
          className="flex-none transition-all hover:opacity-80 py-1"
        >
          <div className="flex items-center gap-1">
            <p className="text-[10px] text-white/50 font-manrope font-bold tracking-[0.15em] uppercase whitespace-nowrap">
              GUESTS :
            </p>
            <p className="text-[12px] text-white font-manrope whitespace-nowrap">
              {mounted ? guests.adults + guests.children : "2"}
            </p>
          </div>
        </Link>

        <button
          onClick={onSearch}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors rounded-none"
          aria-label="Search Villas"
        >
          <Search className="w-[17px] h-[17px] text-white/70 hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
