import { addDays, todayIST } from "@/lib/bookingDates";
import { auditLog } from "@/lib/audit/auditLog";
import {
  axisRoomsApiUrl,
  getAxisRoomsAccessKey,
  getAxisRoomsChannelId,
} from "./config";
import type { AxisRoomsPushResult } from "./types";

/** API 15 — open/close restrictions for OTA channels. */
export async function pushCmRestrictions(params: {
  hotelId: string;
  roomId: string;
  ratePlanId: string;
  /** open = sellable, close = stop sales on OTAs */
  reStatus: "open" | "close";
  startDate?: string;
  endDate?: string;
  auditTargetId?: string;
}): Promise<AxisRoomsPushResult> {
  const accessKey = getAxisRoomsAccessKey();
  const channelId = getAxisRoomsChannelId();
  if (!accessKey || !channelId) {
    return { ok: false, error: "Axis Rooms not configured" };
  }

  const startDate = params.startDate ?? todayIST();
  const endDate = params.endDate ?? addDays(startDate, 365);

  const body = {
    accessKey,
    channelId,
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            rateplans: [
              {
                rateplanId: params.ratePlanId,
                restrictionDetails: [
                  {
                    startDate,
                    endDate,
                    resType: "Master",
                    reStatus: params.reStatus,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(axisRoomsApiUrl("/api/cm-restrictions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      return { ok: false, error: `Restrictions push failed (${res.status})` };
    }

    await auditLog({
      action: "axisrooms.restrictions.push",
      targetType: "villa",
      targetId: params.auditTargetId,
      metadata: { reStatus: params.reStatus, hotelId: params.hotelId },
    });

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Restrictions push failed",
    };
  }
}
