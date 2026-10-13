export type PricingMode = "stay" | "event" | "auto";

function firstNumber(s?: string | null) {
  if (!s) return null;
  const m = String(s).match(/(\d[\d,]*)/);
  if (!m?.[1]) return null;
  return parseInt(m[1].replace(/,/g, ""), 10);
}

function maxNumberFromRange(s?: string | null) {
  if (!s) return null;
  const raw = String(s);
  // Match "10-30 Guests", "50 - 500", etc.
  const range = raw.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
  if (range?.[2]) return parseInt(range[2].replace(/,/g, ""), 10);
  return firstNumber(raw);
}

export function getEventCapacity(villa: any): number | null {
  return maxNumberFromRange(villa?.stats?.events);
}

export function getStayCapacity(villa: any): number | null {
  // Some data contains "15 Guests" or "15 Guests Ref/..." strings
  const raw = String(villa?.stats?.stay ?? "");
  const cleaned = raw.split("Ref/")[0];
  return maxNumberFromRange(cleaned);
}

export function getBhk(villa: any): number | null {
  return firstNumber(villa?.stats?.bhk);
}

function statHasLabelWords(s?: string | null): boolean {
  if (!s) return false;
  return /[a-zA-Z]/.test(String(s));
}

/** Intro stats row — keep unit labels (Guests, BHK, Stay) beside icons. */
export function formatIntroEventStat(
  villa: { stats?: { events?: string } } | null | undefined,
  fallback: string,
): string {
  const raw = villa?.stats?.events?.trim();
  if (raw && statHasLabelWords(raw)) return raw;
  const n = getEventCapacity(villa);
  if (n != null) return `${n} Guests`;
  return raw || fallback;
}

export function formatIntroStayStat(
  villa: { stats?: { stay?: string } } | null | undefined,
  fallback: string,
): string {
  const raw = String(villa?.stats?.stay ?? "")
    .split("Ref/")[0]
    .trim();
  if (raw && statHasLabelWords(raw)) {
    return raw.toLowerCase().includes("stay") ? raw : `${raw} Stay`;
  }
  const n = getStayCapacity(villa);
  if (n != null) return `${n} Stay`;
  return raw ? `${raw} Stay` : fallback;
}

export function formatIntroBhkStat(
  villa: { stats?: { bhk?: string } } | null | undefined,
  fallback: string,
): string {
  const raw = villa?.stats?.bhk?.trim();
  if (raw && statHasLabelWords(raw)) return raw;
  const n = getBhk(villa);
  if (n != null) return `${n} BHK`;
  return raw ? `${raw} BHK` : fallback;
}

export function getStartingFromPrice(villa: any, mode: PricingMode = "auto") {
  const pricing = villa?.pricing as any | undefined;
  if (!pricing) return null;

  const pick = (key: "stay" | "event") =>
    pricing?.[key]?.packages?.[0]?.price as string | undefined;

  const priceRaw =
    mode === "stay"
      ? pick("stay")
      : mode === "event"
        ? pick("event")
        : pick("stay") || pick("event");

  if (!priceRaw) return null;

  // Display cleanly (remove "+ taxes" but keep currency + commas)
  return priceRaw.replace(/\s*\+\s*taxes\s*/i, "").trim();
}

