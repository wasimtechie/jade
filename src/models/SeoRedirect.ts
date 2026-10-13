import mongoose, { Schema, model, models } from "mongoose";

const SeoRedirectSchema = new Schema(
  {
    fromPath: { type: String, required: true, unique: true, index: true },
    toPath: { type: String, required: true },
    type: { type: String, enum: ["301", "302"], default: "301" },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    note: String,
    testStatus: {
      type: String,
      enum: ["active", "broken", "conflict", "loop", "untested"],
      default: "untested",
    },
    lastTestedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const SeoRedirectModel =
  models.SeoRedirect ?? model("SeoRedirect", SeoRedirectSchema);
