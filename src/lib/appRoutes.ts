/**
 * Canonical in-app routes — single source of truth for links and safe back navigation.
 * Do not use legacy paths (/villa-retreats, /party-villa-retreats).
 */

import { VILLAS } from "@/lib/mockData";

const VILLA_IDS = new Set(VILLAS.map((v) => v.id));

/** Menu / directory category label → listing or experience route */
export const VILLA_CATEGORY_ROUTE: Record<string, string> = {
  All: "/retreats/",
  Weddings: "/weddings",
  "Pre-wedding": "/weddings",
  "Corporate Retreats": "/corporate-retreats",
  "Weekend Getaways": "/weekend-getaways",
  "Party Venues": "/party-villas",
  "Wellness Retreats": "/retreats/?category=Wellness Retreats",
};

const ACTIVE_PATH_PREFIXES = [
  "/",
  "/retreats",
  "/retreat",
  "/weddings",
  "/party-villas",
  "/corporate-retreats",
  "/weekend-getaways",
  "/experiences",
  "/menu",
  "/book",
  "/blogs",
  "/about",
  "/contact",
  "/careers",
  "/caravans",
  "/wishlist",
  "/privacy-policy",
  "/terms-conditions",
  "/refund-policy",
] as const;

const FORBIDDEN_PATH_PREFIXES = ["/villa-retreats", "/party-villa-retreats"] as const;

export const LISTING_RETURN_STORAGE_KEY = "jade:listingReturn";

/** Query flag — scroll `/retreats/` to the filter + results carousel (skip hero). */
export const VILLA_LISTING_FOCUS_PARAM = "focus";
export const VILLA_LISTING_FOCUS_RESULTS = "listing";

export function villaListingPath(query?: { category?: string }): string {
  if (!query?.category?.trim()) return "/retreats/";
  return `/retreats/?category=${encodeURIComponent(query.category.trim())}`;
}

/** Villa directory results (filters + cards) — used after booking date/guest selection. */
export function villaListingResultsPath(query?: { category?: string }): string {
  const params = new URLSearchParams();
  if (query?.category?.trim()) {
    params.set("category", query.category.trim());
  }
  params.set(VILLA_LISTING_FOCUS_PARAM, VILLA_LISTING_FOCUS_RESULTS);
  return `/retreats/?${params.toString()}`;
}

export function villaDetailPath(id: string): string {
  return `/retreat/${id}/`;
}

export function villaSpacesPath(id: string): string {
  return `/retreat/${id}/spaces/`;
}

export function bookPath(villaId?: string): string {
  if (!villaId?.trim()) return "/book";
  return `/book?villa=${encodeURIComponent(villaId.trim())}`;
}

export function experiencesListingPath(): string {
  return "/experiences";
}

export function caravansPath(): string {
  return "/caravans";
}

/** Home §3 + /experiences scroll panels — same targets as menu category tabs */
export type ExperiencePanelRouteTarget =
  | "Weekend Getaways"
  | "Party Venues"
  | "Weddings"
  | "Corporate Retreats"
  | "Wellness Retreats"
  | "caravans"
  | "villas";

export function experiencePanelHref(target: ExperiencePanelRouteTarget): string {
  if (target === "caravans") return caravansPath();
  if (target === "villas") return villaListingPath();
  return categoryToListingPath(target);
}

export function categoryToListingPath(category: string): string {
  const dedicated = VILLA_CATEGORY_ROUTE[category];
  if (dedicated) return dedicated;
  return villaListingPath({ category });
}

export function isValidVillaId(id: string): boolean {
  return VILLA_IDS.has(id);
}

export function isForbiddenPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return FORBIDDEN_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isActiveAppPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (!path || isForbiddenPath(path)) return false;
  if (path === "/") return true;
  return ACTIVE_PATH_PREFIXES.some((prefix) => {
    if (prefix === "/") return false;
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

function normalizePathname(pathname: string): string {
  try {
    const path = pathname.split("?")[0]?.split("#")[0] ?? "";
    if (!path) return "";
    return path.startsWith("/") ? path.replace(/\/+$/, "") || "/" : `/${path}`;
  } catch {
    return "";
  }
}

/** Parse pathname + search from a full URL or path string */
export function pathFromHref(href: string): string {
  try {
    if (href.startsWith("http")) {
      const url = new URL(href);
      return `${url.pathname}${url.search}`;
    }
    return href.startsWith("/") ? href : `/${href}`;
  } catch {
    return "";
  }
}

export function resolveSafeBackTarget(
  fallbackPath: string,
  options?: { referrer?: string; storedListing?: string | null },
): string {
  const fallback = sanitizeTarget(fallbackPath);

  const stored = options?.storedListing?.trim();
  if (stored && isActiveAppPath(pathFromHref(stored)) && !isForbiddenPath(pathFromHref(stored))) {
    return stored;
  }

  if (options?.referrer) {
    try {
      const refUrl = new URL(options.referrer);
      if (typeof window !== "undefined" && refUrl.origin === window.location.origin) {
        const target = `${refUrl.pathname}${refUrl.search}`;
        if (isActiveAppPath(target) && !isForbiddenPath(target)) {
          return target;
        }
      }
    } catch {
      // ignore invalid referrer
    }
  }

  return fallback;
}

function sanitizeTarget(path: string): string {
  const normalized = pathFromHref(path);
  if (isActiveAppPath(normalized) && !isForbiddenPath(normalized)) {
    return normalized;
  }
  return "/retreats/";
}

export function villaDetailBackTarget(): string {
  if (typeof window === "undefined") return villaListingPath();
  return resolveSafeBackTarget(villaListingPath(), {
    referrer: document.referrer,
    storedListing: sessionStorage.getItem(LISTING_RETURN_STORAGE_KEY),
  });
}

export function villaSpacesBackTarget(villaId: string): string {
  return villaDetailPath(villaId);
}

/** Call before navigating to a villa detail page from an internal listing */
export function rememberListingReturn(href?: string): void {
  if (typeof window === "undefined") return;
  const path =
    href ??
    `${window.location.pathname}${window.location.search}`;
  if (isActiveAppPath(path) && !isForbiddenPath(path)) {
    sessionStorage.setItem(LISTING_RETURN_STORAGE_KEY, path);
  }
}
