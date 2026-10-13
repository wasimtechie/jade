/** Format INR from paise for modification emails. */
export function formatInrFromPaise(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/**
 * Human-readable price delta for date-change emails.
 * Returns undefined when totals are unchanged.
 */
export function formatPricingDeltaLabel(
  oldTotalPaise: number,
  newTotalPaise: number,
): string | undefined {
  const delta = newTotalPaise - oldTotalPaise;
  if (delta === 0) return undefined;
  const abs = formatInrFromPaise(Math.abs(delta));
  return delta > 0 ? `+${abs} (increase)` : `−${abs} (decrease)`;
}

export function formatStayRange(checkIn: string, checkOut: string): string {
  return `${checkIn} → ${checkOut}`;
}
