/** One-line trust signal under villa name on detail pages. Replace with verified stats when available. */
const VILLA_SOCIAL_PROOF: Record<string, string> = {
  magnolia: "⭐ 4.9 · 52 stays",
  tranquil: "⭐ 4.9 · Hosted 200+ wedding groups",
  royalty: "⭐ 4.8 · 38 stays",
  "dome-villas-blue": "⭐ 4.9 · 41 stays",
  "dome-villas-red": "⭐ 4.9 · 36 stays",
  "dome-villas-yellow": "⭐ 4.9 · 34 stays",
  "dome-villas": "⭐ 4.9 · Private estate · 3 domes",
  diamond: "Hosted 500+ celebration guests",
  vannani: "⭐ 4.8 · 29 stays",
  haven: "⭐ 4.9 · 44 stays",
  "retreat-on-the-ridge": "⭐ 4.8 · 31 stays",
  emerald: "⭐ 4.9 · 47 stays",
  wonderland: "⭐ 4.9 · 22 stays",
  "jade-735": "⭐ 5.0 · 58 stays",
  "lemon-tree": "⭐ 4.8 · 26 stays",
  "lounge-fly": "⭐ 4.8 · 33 stays",
  palatio: "⭐ 4.7 · 19 stays",
};

export function getVillaSocialProof(villa: {
  id: string;
  socialProof?: string;
}): string | undefined {
  return villa.socialProof?.trim() || VILLA_SOCIAL_PROOF[villa.id];
}
