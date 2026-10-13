import type { AxisRoomsMapping } from "./types";

export function villaAxisRoomsMapping(
  villa: { axisRooms?: AxisRoomsMapping | null },
): AxisRoomsMapping {
  const m = villa.axisRooms ?? {};
  const rawUnits = Number(m.inventoryUnits);
  const inventoryUnits =
    Number.isFinite(rawUnits) && rawUnits >= 1 ? Math.floor(rawUnits) : 1;
  return {
    propertyId: m.propertyId?.trim() || undefined,
    roomTypeId: m.roomTypeId?.trim() || undefined,
    ratePlanId: m.ratePlanId?.trim() || undefined,
    ratePlanName: m.ratePlanName?.trim() || undefined,
    inventoryUnits,
  };
}

export function isAxisRoomsMapped(villa: {
  channelMode?: string | null;
  axisRooms?: AxisRoomsMapping | null;
}): boolean {
  const mode = villa.channelMode ?? "website_only";
  if (mode !== "channel_managed") return false;
  const m = villaAxisRoomsMapping(villa);
  return Boolean(m.propertyId && m.roomTypeId);
}
