const BASE = "https://jadehospitainment.com";

/** Resolve a root-relative asset path or return absolute URLs untouched. */
export function absoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(encodeURI(normalized), BASE).href;
}

/** Meta / OG descriptions: single line, ellipsis-truncated. */
export function trimMetaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export const SITE_ORIGIN = BASE;
