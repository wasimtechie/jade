export type BookingCalendarDate = {
  iso: string;
  year: number;
  month: number;
  day: number;
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function toBookingCalendarDate(
  year: number,
  month: number,
  day: number,
): BookingCalendarDate {
  return {
    iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    year,
    month,
    day,
  };
}

export function compareBookingCalendarDates(
  left: BookingCalendarDate,
  right: BookingCalendarDate,
): number {
  return left.iso.localeCompare(right.iso);
}

export function isBookingCalendarDateInRange(
  date: BookingCalendarDate,
  start: BookingCalendarDate,
  end: BookingCalendarDate,
): boolean {
  return date.iso > start.iso && date.iso < end.iso;
}

export function formatBookingCalendarDate(
  date: BookingCalendarDate | null,
): string {
  if (!date) return "---";
  return `${date.day} ${MONTH_SHORT[date.month]}`;
}
