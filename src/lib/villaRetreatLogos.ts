const LOGO_BASE = "/Villas_Retreat_Logos";

/** Per-villa retreat wordmarks for villa detail hero overlay. */
export const VILLA_RETREAT_LOGO_BY_ID: Record<string, string> = {
  magnolia: `${LOGO_BASE}/Magnolia Logo-01.webp`,
  tranquil: `${LOGO_BASE}/Tranquil Woods.webp`,
  royalty: `${LOGO_BASE}/royalty logo.webp`,
  diamond: `${LOGO_BASE}/diamond logo.webp`,
  haven: `${LOGO_BASE}/haven.webp`,
  "retreat-on-the-ridge": `${LOGO_BASE}/ROR.webp`,
  emerald: `${LOGO_BASE}/Emerald.webp`,
  wonderland: `${LOGO_BASE}/WONDERLAND_BY_JADE_V1.webp`,
  "jade-735": `${LOGO_BASE}/735 Jade.webp`,
  "lounge-fly": `${LOGO_BASE}/Lounge fly logo-01.webp`,
  palatio: `${LOGO_BASE}/Palatio.webp`,
  vannani: `${LOGO_BASE}/vanani.webp`,
};

export function getVillaRetreatLogoSrc(villaId: string | undefined): string | null {
  if (!villaId) return null;
  return VILLA_RETREAT_LOGO_BY_ID[villaId] ?? null;
}
