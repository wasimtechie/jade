"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg:` (1024px) — used to pick mobile vs desktop image paths without loading both. */
export function useMediaMinLg(): boolean {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isLg;
}
