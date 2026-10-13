import { useEffect } from "react";

/** Lock document scroll while a form overlay is open (matches venue overlay behavior). */
export function useFormOverlayScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLocked]);
}
