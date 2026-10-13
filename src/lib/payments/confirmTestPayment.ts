/** Client helper — simulated Pay when PAYMENT_GATEWAY_MODE=test. */
export async function confirmTestPayment(params: {
  bookingId: string;
  bookingToken: string;
}): Promise<{ ok: boolean; alreadyConfirmed?: boolean; error?: string }> {
  const res = await fetch("/api/payments/test-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    alreadyConfirmed?: boolean;
    error?: string;
  };
  if (!res.ok) {
    return { ok: false, error: data.error ?? "Payment could not be confirmed" };
  }
  return { ok: true, alreadyConfirmed: data.alreadyConfirmed };
}
