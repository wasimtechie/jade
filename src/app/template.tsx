"use client";

import { useEffect } from "react";
import { scrollToPageTopWithRetries } from "@/lib/scrollToPageTop";
import {
  VILLA_LISTING_FOCUS_PARAM,
  VILLA_LISTING_FOCUS_RESULTS,
} from "@/lib/appRoutes";

function shouldSkipScrollToTop(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    window.location.pathname.replace(/\/+$/, "") === "/retreats" &&
    params.get(VILLA_LISTING_FOCUS_PARAM) === VILLA_LISTING_FOCUS_RESULTS
  );
}

/**
 * App Router template remounts on every navigation — guarantees scroll reset on all pages.
 * Skips reset when booking flow lands on villa results (`?focus=listing`).
 * Uses window.location (not useSearchParams) so prerender stays Suspense-safe.
 */
export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (shouldSkipScrollToTop()) return;
    scrollToPageTopWithRetries();
  }, []);

  return <>{children}</>;
}
