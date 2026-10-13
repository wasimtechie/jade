/** URLs that Next/Image cannot optimize (GridFS / CMS media API). */
export function isUnoptimizedMediaUrl(url: string): boolean {
  return (
    url.startsWith("/api/media/") || url.startsWith("/api/cms/media/")
  );
}
