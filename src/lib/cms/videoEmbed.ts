export function parseVideoEmbed(url: string): {
  provider: "youtube" | "vimeo" | null;
  embedUrl: string | null;
} {
  const trimmed = url.trim();
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i) ??
    trimmed.match(/youtube\.com\/embed\/([\w-]+)/i);
  if (ytMatch?.[1]) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }
  return { provider: null, embedUrl: null };
}
