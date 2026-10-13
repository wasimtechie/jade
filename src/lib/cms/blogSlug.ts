/** Root blog articles cannot use slugs owned by application routes. */
const reservedSlugs = new Set([
  "about", "admin", "api", "blogs", "book", "caravans", "careers", "contact",
  "corporate-retreats", "dashboard", "experiences", "login", "menu", "party-villas",
  "privacy-policy", "refund-policy", "terms-conditions", "villas", "weddings",
  "weekend-getaways", "wishlist", "retreat", "retreats", "all-experiences", "_next",
]);

export function blogSlugError(slug: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "Use a lowercase slug with letters, numbers and hyphens.";
  if (reservedSlugs.has(slug)) return "This slug is reserved for a website page.";
  return null;
}
