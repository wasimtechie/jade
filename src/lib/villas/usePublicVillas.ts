"use client";

import { useEffect, useState } from "react";
import { VILLAS } from "@/lib/mockData";
import type { Villa } from "@/lib/types";

type PublicVillasState = {
  villas: Villa[];
  loading: boolean;
  live: boolean;
};

/** Client hook — loads merged Mongo + static villa directory for /retreats/ listing. */
export function usePublicVillas(): PublicVillasState {
  const [state, setState] = useState<PublicVillasState>({
    villas: VILLAS as Villa[],
    loading: true,
    live: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/public/villas", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load villas");
        const data = (await res.json()) as { villas?: Villa[] };
        if (
          !cancelled &&
          Array.isArray(data.villas) &&
          data.villas.length > 0
        ) {
          setState({ villas: data.villas, loading: false, live: true });
          return;
        }
      } catch {
        /* static bundle fallback */
      }
      if (!cancelled) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
