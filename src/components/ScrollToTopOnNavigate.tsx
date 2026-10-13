"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollToPageTopWithRetries } from "@/lib/scrollToPageTop";
import {
  VILLA_LISTING_FOCUS_PARAM,
  VILLA_LISTING_FOCUS_RESULTS,
} from "@/lib/appRoutes";

/**
 * Ensures every route change, refresh, redirect, and back/forward starts at the hero/first section.
 * Exception: `/retreats/?focus=listing` scrolls to results (booking date/guest → pick villa).
 */
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const routeKey = search ? `${pathname}?${search}` : pathname;
  const skipTopForListingFocus =
    pathname.replace(/\/+$/, "") === "/retreats" &&
    searchParams?.get(VILLA_LISTING_FOCUS_PARAM) === VILLA_LISTING_FOCUS_RESULTS;

  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (skipTopForListingFocus) return;
    scrollToPageTopWithRetries();
  }, [routeKey, skipTopForListingFocus]);

  useEffect(() => {
    const shouldSkipTop = () => {
      const params = new URLSearchParams(window.location.search);
      return (
        window.location.pathname.replace(/\/+$/, "") === "/retreats" &&
        params.get(VILLA_LISTING_FOCUS_PARAM) === VILLA_LISTING_FOCUS_RESULTS
      );
    };

    const onPopState = () => {
      if (shouldSkipTop()) return;
      scrollToPageTopWithRetries();
    };
    const onPageShow = () => {
      if (shouldSkipTop()) return;
      scrollToPageTopWithRetries();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
