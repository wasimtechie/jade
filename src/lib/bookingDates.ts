/**
 * YYYY-MM-DD date utilities — exclusive-end overlap, IST day boundaries.
 */

export function parseDateOnly(s: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error(`Invalid date string: ${s}`);
  }
  return new Date(`${s}T00:00:00.000Z`);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateOnly(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightCount(checkIn: string, checkOut: string): number {
  const a = parseDateOnly(checkIn).getTime();
  const b = parseDateOnly(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

/** Exclusive end: A checkOut === B checkIn → no overlap (same-day turnover OK). */
export function rangesOverlap(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string,
): boolean {
  return aIn < bOut && bIn < aOut;
}

export function expandNightDates(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let cur = checkIn;
  while (cur < checkOut) {
    nights.push(cur);
    cur = addDays(cur, 1);
  }
  return nights;
}

export function expandDateRangeInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = start;
  while (cur <= end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

export function nowIST(): Date {
  return new Date();
}

export function todayIST(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function isoFromBoundary(d: Date): string {
  return d.toISOString().slice(0, 10);
}
