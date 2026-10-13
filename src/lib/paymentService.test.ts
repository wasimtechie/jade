import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initiatePayment } from "./paymentService";

describe("initiatePayment", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends bookingId when opts.bookingId is set", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          configured: true,
          orderId: "order_x",
          amount: 100_00,
          keyId: "key_test",
        }),
        { status: 200 },
      ),
    );

    const bookingId = "a1b2c3d4-5e6f-4789-a012-3456789abcde";
    await initiatePayment(1000, "ref-1", { bookingId });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.bookingId).toBe(bookingId);
    expect(body.amountSubunits).toBeUndefined();
  });

  it("sends amountSubunits when no booking id", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          orderId: "order_y",
          amount: 500_00,
          keyId: "key_test",
        }),
        { status: 200 },
      ),
    );

    await initiatePayment(5000, "ref-2");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.bookingId).toBeUndefined();
    expect(body.amountSubunits).toBe(500_000);
  });
});
