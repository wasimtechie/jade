import { addDays, todayIST } from "@/lib/bookingDates";
import type {
  CalendarBlock,
  CalendarStats,
  CalendarVilla,
  DayOccupancy,
} from "./types";
import type { BookingRecord } from "@/lib/bookings/store";

function coversNight(
  checkIn: string,
  checkOut: string,
  night: string,
): boolean {
  return night >= checkIn && night < checkOut;
}

export function computeCalendarStats(
  villas: CalendarVilla[],
  bookings: BookingRecord[],
  blocks: CalendarBlock[],
  days: string[],
): CalendarStats {
  const bookable = villas.filter((v) => v.bookable !== false);
  const focusDay = days.includes(todayIST()) ? todayIST() : days[0]!;

  let arrivals = 0;
  let departures = 0;
  let inHouse = 0;
  let occupiedTonight = 0;
  let pendingCount = 0;
  let conflictCount = 0;

  for (const b of bookings) {
    if (days.includes(b.checkIn)) arrivals++;
    if (days.includes(b.checkOut)) departures++;
    if (coversNight(b.checkIn, b.checkOut, focusDay)) {
      inHouse++;
      if (b.status === "confirmed" || b.status === "pending") occupiedTonight++;
    }
    if (b.status === "pending") pendingCount++;
    if (b.status === "conflict") conflictCount++;
  }

  let blockedNights = 0;
  for (const bl of blocks) {
    for (const day of days) {
      if (coversNight(bl.checkIn, bl.checkOut, day)) blockedNights++;
    }
  }

  return {
    arrivals,
    departures,
    inHouse,
    occupiedTonight,
    bookableVillas: bookable.length,
    pendingCount,
    conflictCount,
    blockedNights,
  };
}

export function computeDayOccupancy(
  villas: CalendarVilla[],
  bookings: BookingRecord[],
  blocks: CalendarBlock[],
  days: string[],
): DayOccupancy[] {
  const bookable = villas.filter((v) => v.bookable !== false);
  const total = bookable.length || 1;

  return days.map((date) => {
    const bookedIds = new Set<string>();
    const blockedIds = new Set<string>();

    for (const v of bookable) {
      const hasBooking = bookings.some(
        (b) =>
          b.villaId === v.id &&
          (b.status === "confirmed" ||
            b.status === "pending" ||
            b.status === "conflict") &&
          coversNight(b.checkIn, b.checkOut, date),
      );
      if (hasBooking) bookedIds.add(v.id);

      const hasBlock = blocks.some(
        (bl) =>
          bl.villaId === v.id && coversNight(bl.checkIn, bl.checkOut, date),
      );
      if (hasBlock) blockedIds.add(v.id);
    }

    const bookedVillas = bookedIds.size;
    const blockedVillas = blockedIds.size;
    const occupancyPct = Math.round((bookedVillas / total) * 100);

    return {
      date,
      bookedVillas,
      blockedVillas,
      bookableTotal: bookable.length,
      occupancyPct,
    };
  });
}

/** Last occupied night for a booking (check-out is exclusive). */
export function lastOccupiedNight(checkIn: string, checkOut: string): string {
  if (checkIn >= checkOut) return checkIn;
  return addDays(checkOut, -1);
}
