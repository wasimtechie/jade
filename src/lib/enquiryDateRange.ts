export const ENQUIRY_CALENDAR_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const ENQUIRY_CALENDAR_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isBetween(d: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

export function formatEnquiryDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPreferredDateRange(
  checkIn: Date | null,
  checkOut: Date | null,
): string {
  if (!checkIn) return "";
  if (!checkOut || sameDay(checkIn, checkOut)) return formatEnquiryDate(checkIn);
  return `${formatEnquiryDate(checkIn)} – ${formatEnquiryDate(checkOut)}`;
}

export function getEnquiryDateDisplayLabel(
  checkIn: Date | null,
  checkOut: Date | null,
): string {
  if (!checkIn) return "";
  if (!checkOut) return `${formatEnquiryDate(checkIn)} – Select checkout`;
  return `${formatEnquiryDate(checkIn)} – ${formatEnquiryDate(checkOut)}`;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
