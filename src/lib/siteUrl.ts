/** Marketing / Resend sending-domain default (footer policy links). */
export const DEFAULT_PUBLIC_SITE_URL = "https://jaderetreats.com";

/**
 * Canonical public site origin for emails, SEO, and absolute links.
 *
 * Preference order:
 * 1. SITE_URL (server override — use for custom / future production domain)
 * 2. NEXT_PUBLIC_SITE_URL when it is a real public URL (not localhost)
 * 3. VERCEL_PROJECT_PRODUCTION_URL (stable production host on Vercel)
 * 4. VERCEL_URL (deployment host)
 * 5. https://jaderetreats.com
 *
 * Localhost is never returned for public/email links unless `allowLocalhost: true`.
 */
export function getSiteBaseUrl(options?: {
  allowLocalhost?: boolean;
}): string {
  const allowLocalhost = options?.allowLocalhost === true;

  const candidates = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined,
  ];

  for (const raw of candidates) {
    const url = normalizeOrigin(raw);
    if (!url) continue;
    if (isLocalhost(url) && !allowLocalhost) continue;
    return url;
  }

  if (allowLocalhost) {
    const local =
      normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
      "http://localhost:3000";
    if (isLocalhost(local)) return local;
  }

  return DEFAULT_PUBLIC_SITE_URL;
}

/**
 * Base URL for guest-facing email links (policy footer, brand).
 * Prefers EMAIL_SITE_URL so links match the Resend sending domain
 * (e.g. jaderetreats.com), independent of dashboard/Vercel host.
 * Never returns localhost.
 */
export function getEmailSiteBaseUrl(): string {
  const candidates = [
    process.env.EMAIL_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  for (const raw of candidates) {
    const url = normalizeOrigin(raw);
    if (!url || isLocalhost(url)) continue;
    return url;
  }

  return DEFAULT_PUBLIC_SITE_URL;
}

function normalizeOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let url = value.trim().replace(/\/$/, "");
  if (!url) return undefined;
  // Vercel often provides host without scheme
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function isLocalhost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}
