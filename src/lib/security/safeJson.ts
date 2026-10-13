/** Thrown when JSON body cannot be read within policy (size, Content-Type, parse). */

export class SafeJsonError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "SafeJsonError";
  }
}

/**
 * Read JSON with a hard byte cap (mitigates oversized-body DoS).
 * Clone the request before calling if you still need `req.json()` elsewhere (you should not).
 */
export async function readJsonBody(
  req: Request,
  maxBytes: number,
): Promise<unknown> {
  const ct = req.headers.get("content-type") ?? "";
  const lower = ct.toLowerCase();
  if (!lower.includes("application/json")) {
    throw new SafeJsonError(
      415,
      "Unsupported Media Type: expected application/json",
    );
  }

  const declared = req.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > maxBytes) {
      throw new SafeJsonError(413, "Payload too large");
    }
  }

  const buf = await req.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new SafeJsonError(413, "Payload too large");
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (!text.trim()) {
    throw new SafeJsonError(400, "Empty body");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new SafeJsonError(400, "Invalid JSON");
  }
}
