import { MEDIA_MANIFEST } from "@/generated/mediaManifest";
import { normalizeImageSrc } from "@/lib/normalizeImageSrc";

/** Neutral 8×5 placeholder when manifest has no entry for a URL */
export const JADE_IMAGE_BLUR_FALLBACK =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

type ManifestWithBlur = typeof MEDIA_MANIFEST & {
  blurByUrl?: Record<string, string>;
};

const blurByUrl = (MEDIA_MANIFEST as ManifestWithBlur).blurByUrl ?? {};

function lookupBlur(src: string): string | undefined {
  if (!src) return undefined;
  const normalized = normalizeImageSrc(src);
  return (
    blurByUrl[normalized] ??
    blurByUrl[src] ??
    blurByUrl[decodeURIComponent(normalized)] ??
    undefined
  );
}

export function getBlurDataURL(src: string): string {
  return lookupBlur(src) ?? JADE_IMAGE_BLUR_FALLBACK;
}
