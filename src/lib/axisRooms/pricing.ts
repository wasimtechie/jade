import { auditLog } from "@/lib/audit/auditLog";
import { postAxisRoomsApi } from "./http";
import type { AxisRoomsPushResult } from "./types";

type PricePushParams = {
  hotelId: string;
  roomId: string;
  ratePlanId: string;
  /** Rupees (Axis expects Double occupancy price) */
  doublePriceRupees: number;
  dates: string[];
  auditTargetId?: string;
};

/** API 6 — daywise price update. */
export async function pushDaywisePrice(
  params: PricePushParams,
): Promise<AxisRoomsPushResult> {
  if (params.dates.length === 0 || params.doublePriceRupees <= 0) {
    return { ok: true };
  }

  const result = await postAxisRoomsApi("/api/daywisePrice", {
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            rateplans: [
              {
                rateplanId: params.ratePlanId,
                priceDetails: params.dates.map((date) => ({
                  date,
                  price: { Double: params.doublePriceRupees },
                })),
              },
            ],
          },
        ],
      },
    ],
  });

  await auditLog({
    action: "axisrooms.price.daywise",
    targetType: "villa",
    targetId: params.auditTargetId,
    metadata: {
      hotelId: params.hotelId,
      dates: params.dates.length,
      api: 6,
      ok: result.ok,
    },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** API 7 — bulk price update for a date range. */
export async function pushBulkPriceForRange(params: {
  hotelId: string;
  roomId: string;
  ratePlanId: string;
  startDate: string;
  endDate: string;
  doublePriceRupees: number;
  auditTargetId?: string;
}): Promise<AxisRoomsPushResult> {
  if (params.doublePriceRupees <= 0) {
    return { ok: true };
  }

  const result = await postAxisRoomsApi("/api/bulkPriceUpdate", {
    hotels: [
      {
        hotelId: params.hotelId,
        rooms: [
          {
            roomId: params.roomId,
            rateplans: [
              {
                rateplanId: params.ratePlanId,
                priceDetails: [
                  {
                    startDate: params.startDate,
                    endDate: params.endDate,
                    price: { Double: params.doublePriceRupees },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  await auditLog({
    action: "axisrooms.price.bulk",
    targetType: "villa",
    targetId: params.auditTargetId,
    metadata: {
      hotelId: params.hotelId,
      startDate: params.startDate,
      endDate: params.endDate,
      api: 7,
      ok: result.ok,
    },
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
