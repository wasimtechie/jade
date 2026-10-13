import { Schema, model, models } from "mongoose";

const WebhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true },
    source: { type: String, enum: ["razorpay", "axisrooms"], required: true },
    status: {
      type: String,
      enum: ["received", "processed", "failed", "ignored"],
      default: "received",
    },
    bookingId: String,
    paymentId: String,
    orderId: String,
    error: String,
    payload: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

WebhookEventSchema.index({ eventId: 1, source: 1 }, { unique: true });

export const WebhookEventModel =
  models.WebhookEvent ?? model("WebhookEvent", WebhookEventSchema);
