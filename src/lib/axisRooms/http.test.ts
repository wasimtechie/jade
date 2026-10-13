import { afterEach, describe, expect, it, vi } from "vitest";
import { getAxisRoomsApi, postAxisRoomsApi } from "./http";
import { isAxisRoomsConfigured } from "./config";
import { assertAxisSandbox } from "../../../scripts/assert-axis-sandbox.mjs";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Axis environment switch", () => {
  it("pauses both GET and POST traffic even with valid-looking credentials", async () => {
    vi.stubEnv("AXIS_ROOMS_ENABLED", "false");
    vi.stubEnv("AXIS_ROOMS_API_KEY", "unit-test-access-key");
    vi.stubEnv("AXIS_ROOMS_CHANNEL_ID", "229");
    vi.stubEnv("AXIS_ROOMS_API_BASE_URL", "https://app.axisrooms.com");
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    expect(isAxisRoomsConfigured()).toBe(false);
    expect((await postAxisRoomsApi("/api/inventory", {})).ok).toBe(false);
    expect((await getAxisRoomsApi("/api/getConnectedChannel")).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the explicitly configured production URL when enabled", async () => {
    vi.stubEnv("AXIS_ROOMS_ENABLED", "true");
    vi.stubEnv("AXIS_ROOMS_API_KEY", "unit-test-access-key");
    vi.stubEnv("AXIS_ROOMS_CHANNEL_ID", "229");
    vi.stubEnv("AXIS_ROOMS_API_BASE_URL", "https://app.axisrooms.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "success" })));
    vi.stubGlobal("fetch", fetchMock);
    expect((await postAxisRoomsApi("/api/inventory", { hotels: [] })).ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("https://app.axisrooms.com/api/inventory");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ accessKey: "unit-test-access-key", channelId: "229", hotels: [] });
  });

  it("blocks production and lookalike hosts from sandbox tools", () => {
    for (const url of ["https://app.axisrooms.com", "https://sandbox2.axisrooms.com.example.com", "http://preprod1.axisrooms.com", "https://other.example.com"]) {
      expect(() => assertAxisSandbox(url)).toThrow();
    }
    expect(() => assertAxisSandbox("https://preprod1.axisrooms.com")).not.toThrow();
    expect(() => assertAxisSandbox("https://sandbox2.axisrooms.com")).not.toThrow();
  });
});
