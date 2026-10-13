import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Skip init in extension contexts (avoids console noise + invalid SDK use). */
function canInitSentryInBrowser(): boolean {
  if (typeof window === "undefined") return true;
  if (window.location.protocol === "chrome-extension:") return false;
  if (window.location.protocol === "moz-extension:") return false;
  return true;
}

if (dsn && canInitSentryInBrowser()) {
  Sentry.init({
    dsn,
    enabled: true,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 0.35 : 0.08,
  });
}

/** Instrument App Router navigations when tracing is enabled (see @sentry/nextjs build hint). */
export const onRouterTransitionStart =
  Sentry.captureRouterTransitionStart;
