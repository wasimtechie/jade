export const DOME_VIDEO_URLS = {
  red: "https://youtu.be/k0-1rTGdowk?si=hVmn5sCIcMwn_deE",
  blue: "https://youtu.be/qcstdzAh1ck?si=8Op3MUQu_Je_8cFk",
  yellow: "https://youtu.be/1FnJXIa7LDg?si=z1TjKQ6TEN8SAbzQ",
} as const;

export type DomeVideoKey = keyof typeof DOME_VIDEO_URLS;

/**
 * Extract a YouTube video id from a variety of YouTube URL formats.
 * Supports:
 *  - https://youtu.be/<id>?...
 *  - https://www.youtube.com/watch?v=<id>&...
 *  - https://www.youtube.com/embed/<id>
 *  - https://www.youtube.com/shorts/<id>
 */
export function getYouTubeId(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.replace("/", "");
    if (u.pathname.startsWith("/embed/"))
      return u.pathname.split("/")[2] || "";
    if (u.pathname.startsWith("/shorts/"))
      return u.pathname.split("/")[2] || "";
    if (u.pathname === "/watch") return u.searchParams.get("v") || "";
    return "";
  } catch {
    return "";
  }
}

export function getYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}
