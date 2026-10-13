"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { DateRange, Guests } from "@/lib/types";

export type { DateRange, Guests } from "@/lib/types";

interface BookingContextProps {
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  guests: Guests;
  setGuests: (guests: Guests) => void;
  resetBooking: () => void;
}

const defaultDateRange: DateRange = {
  checkIn: null,
  checkOut: null,
};

const defaultGuests: Guests = {
  adults: 2,
  children: 0,
  pets: 0,
};

const BookingContext = createContext<BookingContextProps | undefined>(
  undefined,
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [guests, setGuests] = useState<Guests>(defaultGuests);

  const resetBooking = () => {
    setDateRange(defaultDateRange);
    setGuests(defaultGuests);
  };

  return (
    <BookingContext.Provider
      value={{
        dateRange,
        setDateRange,
        guests,
        setGuests,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
