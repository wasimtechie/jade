/** Blog CMS path revalidation for ISR. */

export function revalidatePathsForPageKey(pageKey: string): string[] {
  if (!pageKey.startsWith("blog/")) return [];
  const slug = pageKey.replace(/^blog\//, "");
  return ["/blogs", "/blogs/", `/${slug}`, `/${slug}/`, `/blogs/${slug}`, "/sitemap.xml"];
}
