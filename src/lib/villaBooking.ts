import { VILLAS } from "@/lib/mockData";
import { isVillaRecordBookable as recordBookable } from "@/lib/villas/villaVisibility";

export { isVillaRecordBookable } from "@/lib/villas/villaVisibility";

/** Static fallback when live API data is unavailable (e.g. /book initial load). */
export function isVillaBookable(villaId: string | null | undefined): boolean {
  if (!villaId) return true;
  const v = VILLAS.find((x) => x.id === villaId);
  if (!v) return true;
  return recordBookable(v);
}
