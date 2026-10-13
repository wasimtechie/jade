import { postAxisRoomsApi } from "./http";
import type { AxisRoomsPushResult } from "./types";

export type OtaAvailabilityDay = {
  date: string;
  free: number;
};

export type OtaRateDay = {
  date: string;
  price: Record<string, number>;
};

/** API 5 — read OTA availability held by Axis for a date range. */
export async function fetchOtaAvailability(params: {
  otaId: number;
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
}): Promise<{
  ok: boolean;
  days: OtaAvailabilityDay[];
  error?: string;
}> {
  const result = await postAxisRoomsApi("/api/otaAvailability", {
    otaId: String(params.otaId),
    hotelId: params.hotelId,
    roomId: params.roomId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (!result.ok) {
    return { ok: false, days: [], error: result.error };
  }

  const data = result.data ?? {};
  const raw = Array.isArray(data.availability) ? data.availability : [];
  const days: OtaAvailabilityDay[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const date = String(o.date ?? "").slice(0, 10);
    const free = Number(o.free ?? o.availability ?? 0);
    if (!date) continue;
    days.push({ date, free: Number.isFinite(free) ? free : 0 });
  }

  return { ok: true, days };
}

/** API 8 — read OTA rates held by Axis for a date range. */
export async function fetchOtaRates(params: {
  otaId: number;
  hotelId: string;
  roomId: string;
  rateplanId: string;
  startDate: string;
  endDate: string;
}): Promise<{
  ok: boolean;
  days: OtaRateDay[];
  error?: string;
}> {
  const result = await postAxisRoomsApi("/api/otaRates", {
    otaId: String(params.otaId),
    hotelId: params.hotelId,
    roomId: params.roomId,
    rateplanId: params.rateplanId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (!result.ok) {
    return { ok: false, days: [], error: result.error };
  }

  const data = result.data ?? {};
  const raw = Array.isArray(data.priceDetails) ? data.priceDetails : [];
  const days: OtaRateDay[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const date = String(o.startDate ?? o.date ?? "").slice(0, 10);
    const price =
      o.price && typeof o.price === "object" && !Array.isArray(o.price)
        ? (o.price as Record<string, number>)
        : {};
    if (!date) continue;
    days.push({ date, price });
  }

  return { ok: true, days };
}

export type VerifyOtaResult = AxisRoomsPushResult & {
  availability?: OtaAvailabilityDay[];
  rates?: OtaRateDay[];
};

/** Compare what Axis holds on an OTA for inventory + rates (debug aid). */
export async function verifyOtaState(params: {
  otaId: number;
  hotelId: string;
  roomId: string;
  rateplanId: string;
  startDate: string;
  endDate: string;
}): Promise<VerifyOtaResult> {
  const [avail, rates] = await Promise.all([
    fetchOtaAvailability({
      otaId: params.otaId,
      hotelId: params.hotelId,
      roomId: params.roomId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    fetchOtaRates({
      otaId: params.otaId,
      hotelId: params.hotelId,
      roomId: params.roomId,
      rateplanId: params.rateplanId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
  ]);

  if (!avail.ok && !rates.ok) {
    return {
      ok: false,
      error: avail.error ?? rates.error ?? "Verify failed",
    };
  }

  return {
    ok: true,
    availability: avail.days,
    rates: rates.days,
    error: avail.error ?? rates.error,
  };
}
