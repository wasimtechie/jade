import { auditLog } from "@/lib/audit/auditLog";
import { getAxisRoomsAccessKey, getAxisRoomsChannelId } from "./config";
import { postAxisRoomsApi } from "./http";
import type { AxisRoomsPushResult } from "./types";

/** API 3 — block inventory on specific OTAs for a date range. */
export async function blockChannelInventory(params: {
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  /** OTA integer ids from Axis Rooms */
  otaIds: number[];
  auditTargetId?: string;
}): Promise<AxisRoomsPushResult> {
  const accessKey = getAxisRoomsAccessKey();
  const channelId = getAxisRoomsChannelId();
  if (!accessKey || !channelId) {
    return { ok: false, error: "Axis Rooms not configured" };
  }
  if (params.otaIds.length === 0) {
    return { ok: false, error: "otaIds required for blockChannel" };
  }

  const result = await postAxisRoomsApi("/api/blockChannel", {
    pmsId: channelId,
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            startDate: params.startDate,
            endDate: params.endDate,
            channelId: params.otaIds,
          },
        ],
      },
    ],
  });

  await auditLog({
    action: "axisrooms.channel.block",
    targetType: "villa",
    targetId: params.auditTargetId,
    metadata: { hotelId: params.hotelId, otaIds: params.otaIds, ok: result.ok },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** API 4 — unblock inventory on specific OTAs. */
export async function unblockChannelInventory(params: {
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  otaIds: number[];
  auditTargetId?: string;
}): Promise<AxisRoomsPushResult> {
  const channelId = getAxisRoomsChannelId();
  if (!channelId) {
    return { ok: false, error: "Axis Rooms not configured" };
  }
  if (params.otaIds.length === 0) {
    return { ok: false, error: "otaIds required for unblockChannel" };
  }

  const result = await postAxisRoomsApi("/api/unblockChannel", {
    pmsId: channelId,
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            startDate: params.startDate,
            endDate: params.endDate,
            channelId: params.otaIds,
          },
        ],
      },
    ],
  });

  await auditLog({
    action: "axisrooms.channel.unblock",
    targetType: "villa",
    targetId: params.auditTargetId,
    metadata: { hotelId: params.hotelId, otaIds: params.otaIds, ok: result.ok },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
