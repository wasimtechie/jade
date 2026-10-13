import { Schema, model, models } from "mongoose";

/** Persistent rate-limit buckets (Mongo — not in-memory). */
const RateLimitBucketSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    resetAt: { type: Date, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: false },
);

export const RateLimitBucketModel =
  models.RateLimitBucket ?? model("RateLimitBucket", RateLimitBucketSchema);
