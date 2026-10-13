import { connectDB } from "@/lib/db";
import type { Types } from "mongoose";

export type AuditAction =
  | "booking.create"
  | "booking.update"
  | "booking.cancel"
  | "booking.confirm_hold"
  | "booking.confirm_external_payment"
  | "booking.expire"
  | "block.create"
  | "block.delete"
  | "villa.update"
  | "user.create"
  | "user.update"
  | "login.success"
  | "login.failed"
  | "logout"
  | "axisrooms.push"
  | "axisrooms.cancel"
  | "refund.issue"
  | "pii.erase"
  | "dev.query"
  | "content.publish";

export interface AuditLogInput {
  userId?: Types.ObjectId | string | null;
  action: AuditAction | string;
  targetType: string;
  targetId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

/** Append-only audit — no update/delete API. */
export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    await connectDB();
    const { AuditLogModel } = await import("@/models/AuditLog");
    await AuditLogModel.create({
      userId: input.userId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      ip: input.ip,
      metadata: input.metadata ?? {},
    });
  } catch (e) {
    console.error("[auditLog]", input.action, e);
  }
}
