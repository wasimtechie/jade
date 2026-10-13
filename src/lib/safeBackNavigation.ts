"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LISTING_RETURN_STORAGE_KEY,
  resolveSafeBackTarget,
} from "@/lib/appRoutes";

/**
 * Navigate back using only validated active routes (never blind history.back()).
 */
export function useSafeBack(fallbackPath: string) {
  const router = useRouter();

  return useCallback(() => {
    const target = resolveSafeBackTarget(fallbackPath, {
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      storedListing:
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem(LISTING_RETURN_STORAGE_KEY)
          : null,
    });
    router.push(target);
  }, [router, fallbackPath]);
}
