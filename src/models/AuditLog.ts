import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: String,
    ip: String,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLogModel =
  models.AuditLog ?? model("AuditLog", AuditLogSchema);
