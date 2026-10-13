import { VILLAS } from "@/lib/mockData";

export function isRegisteredVillaId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const t = id.trim();
  if (!/^[a-z0-9-]{1,80}$/i.test(t)) return false;
  return VILLAS.some((v) => v.id === t);
}
