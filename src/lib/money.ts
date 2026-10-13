/** Paise-only money helpers — sole rupee→paise boundary at API/forms. */

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) throw new Error("Invalid rupee amount");
  return Math.round(rupees * 100);
}

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}
