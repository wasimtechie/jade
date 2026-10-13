import { getAxisRoomsChannelId } from "./config";
import { getAxisRoomsApi } from "./http";

export type ConnectedOta = {
  channelId: number;
  channelName: string;
};

/** API 13 — list OTAs connected to this PMS channel. */
export async function fetchConnectedOtas(): Promise<{
  ok: boolean;
  otas: ConnectedOta[];
  error?: string;
}> {
  const pmsId = getAxisRoomsChannelId();
  if (!pmsId) {
    return { ok: false, otas: [], error: "Axis Rooms not configured" };
  }

  const result = await getAxisRoomsApi("/api/getConnectedChannel", {
    pmsId,
  });

  if (!result.ok) {
    return { ok: false, otas: [], error: result.error };
  }

  const data = result.data ?? {};
  const raw =
    (Array.isArray(data.channels) && data.channels) ||
    (Array.isArray(data.channelList) && data.channelList) ||
    (Array.isArray(data.data) && data.data) ||
    [];

  const otas: ConnectedOta[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = Number(row.channelId ?? row.id ?? row.otaId);
    const name = String(row.channelName ?? row.name ?? row.ota ?? "").trim();
    if (!Number.isFinite(id) || !name) continue;
    otas.push({ channelId: id, channelName: name });
  }

  return { ok: true, otas };
}
