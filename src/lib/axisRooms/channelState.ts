export type VillaChannelMode = "website_only" | "channel_managed";

export type VillaChannelState = "website_only" | "awaiting_mapping" | "live";

export function deriveChannelState(villa: {
  channelMode?: string | null;
  axisRooms?: {
    propertyId?: string | null;
    roomTypeId?: string | null;
  } | null;
}): VillaChannelState {
  const mode = (villa.channelMode ?? "website_only") as VillaChannelMode;
  if (mode !== "channel_managed") return "website_only";
  const propertyId = villa.axisRooms?.propertyId?.trim();
  const roomTypeId = villa.axisRooms?.roomTypeId?.trim();
  if (propertyId && roomTypeId) return "live";
  return "awaiting_mapping";
}

export const CHANNEL_STATE_LABELS: Record<VillaChannelState, string> = {
  website_only: "Website only",
  awaiting_mapping: "Awaiting Axis mapping",
  live: "Live on OTAs",
};
