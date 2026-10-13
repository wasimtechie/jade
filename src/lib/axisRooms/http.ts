import {
  axisRoomsApiUrl,
  getAxisRoomsAccessKey,
  getAxisRoomsChannelId,
} from "./config";

export type AxisRoomsApiResponse = {
  ok: boolean;
  error?: string;
  status?: number;
  data?: Record<string, unknown>;
};

/** POST to Axis Rooms with accessKey + channelId merged into JSON body. */
export async function postAxisRoomsApi(
  path: string,
  body: Record<string, unknown>,
): Promise<AxisRoomsApiResponse> {
  const accessKey = getAxisRoomsAccessKey();
  const channelId = getAxisRoomsChannelId();
  if (!accessKey || !channelId) {
    return { ok: false, error: "Axis Rooms not configured" };
  }

  try {
    const res = await fetch(axisRoomsApiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessKey, channelId, ...body }),
      signal: AbortSignal.timeout(25_000),
    });

    const data = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!res.ok) {
      const message =
        typeof data.message === "string"
          ? data.message
          : `HTTP ${res.status}`;
      return { ok: false, error: message, status: res.status, data };
    }

    const status = String(data.status ?? "").toLowerCase();
    if (status === "failure" || status === "error") {
      return {
        ok: false,
        error:
          typeof data.message === "string"
            ? data.message
            : `errorCode ${String(data.errorCode ?? "unknown")}`,
        data,
      };
    }

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Axis Rooms request failed",
    };
  }
}

/** GET from Axis Rooms (API 13 etc.). accessKey appended as query param. */
export async function getAxisRoomsApi(
  path: string,
  query: Record<string, string> = {},
): Promise<AxisRoomsApiResponse> {
  const accessKey = getAxisRoomsAccessKey();
  const channelId = getAxisRoomsChannelId();
  if (!accessKey || !channelId) {
    return { ok: false, error: "Axis Rooms not configured" };
  }

  const params = new URLSearchParams({
    accessKey,
    channelId,
    ...query,
  });
  const url = `${axisRoomsApiUrl(path)}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(25_000),
    });

    const data = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!res.ok) {
      const message =
        typeof data.message === "string"
          ? data.message
          : `HTTP ${res.status}`;
      return { ok: false, error: message, status: res.status, data };
    }

    const status = String(data.status ?? "").toLowerCase();
    if (status === "failure" || status === "error") {
      return {
        ok: false,
        error:
          typeof data.message === "string"
            ? data.message
            : `errorCode ${String(data.errorCode ?? "unknown")}`,
        data,
      };
    }

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Axis Rooms request failed",
    };
  }
}
