/**
 * Single source of truth for "open in Google Maps" links across villa details,
 * venue overlays, and booking flows.
 *
 * Priority: explicit `googleMapsUrl` → lat/lng → address + short location → fallbacks.
 */

export type VillaMapsInput = {
  location?: string;
  locationDetails?: {
    address?: string;
    mapImage?: string;
    distance?: string;
    googleMapsUrl?: string;
    coordinates?: { lat: number; lng: number };
  } | null;
};

function tryNormalizeExternalHref(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith("//")) return `https:${t}`;
    const probe = /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(t.replace(/\s/g, ""))
      ? `https://${t}`
      : t;
    const u = new URL(probe);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    /* ignore */
  }
  return null;
}

/** Opens Google Maps in a browser; safe to use as `<a href={...}>` */
export function getVillaGoogleMapsUrl(entity: VillaMapsInput): string {
  const explicit = entity.locationDetails?.googleMapsUrl;
  const normalizedExplicit = explicit ? tryNormalizeExternalHref(explicit) : null;
  if (normalizedExplicit) return normalizedExplicit;

  const coords = entity.locationDetails?.coordinates;
  if (
    coords &&
    typeof coords.lat === "number" &&
    typeof coords.lng === "number" &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng)
  ) {
    const q = `${coords.lat},${coords.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }

  const address = entity.locationDetails?.address?.trim();
  const shortLoc = entity.location?.trim();
  let q =
    address && shortLoc ? `${address} — ${shortLoc}` : address || shortLoc || "";
  q = q.replace(/\s+/g, " ").trim();

  if (!q) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      "Jade Retreats Karnataka India",
    )}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
