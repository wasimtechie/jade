import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { auditLog } from "@/lib/audit/auditLog";

export type InboundLogPhase =
  | "received"
  | "validated"
  | "axis_verified"
  | "api2_pushed"
  | "api2_failed"
  | "processed"
  | "rejected"
  | "duplicate";

export type InboundLogEntry = {
  phase: InboundLogPhase;
  bookingNo?: string;
  eventType?: string;
  ok: boolean;
  error?: string;
  httpStatus?: number;
  metadata?: Record<string, unknown>;
};

/** Persist inbound webhook attempts to audit log + local JSONL (dev). */
export async function logAxisRoomsInbound(entry: InboundLogEntry): Promise<void> {
  await auditLog({
    action: "axisrooms.inbound",
    targetType: "webhook",
    targetId: entry.bookingNo,
    metadata: {
      phase: entry.phase,
      ok: entry.ok,
      error: entry.error,
      httpStatus: entry.httpStatus,
      eventType: entry.eventType,
      ...entry.metadata,
    },
  });

  if (process.env.AXIS_ROOMS_INBOUND_LOG_FILE === "false") return;

  try {
    const logDir = path.join(process.cwd(), "logs");
    await mkdir(logDir, { recursive: true });
    await appendFile(
      path.join(logDir, "axisrooms-inbound.jsonl"),
      `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`,
    );
  } catch {
    // Read-only FS (e.g. Vercel) — audit log is the source of truth.
  }
}
