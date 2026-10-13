/**
 * Local `public/` asset paths can contain spaces; `next/image` expects URI-encoded paths.
 * Avoid double-encoding already-escaped sequences (e.g. `%20` -> `%2520`).
 */
export function normalizeImageSrc(src: string): string {
  if (!src || !src.startsWith("/")) return src;
  if (src.includes("%20") || src.includes("%23") || src.includes("%3F")) {
    return src;
  }
  return src
    .replace(/ /g, "%20")
    .replace(/#/g, "%23")
    .replace(/\?/g, "%3F");
}
