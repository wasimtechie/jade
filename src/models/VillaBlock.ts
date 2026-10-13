import { Schema, model, models } from "mongoose";

const VillaBlockSchema = new Schema(
  {
    villaId: { type: Schema.Types.ObjectId, ref: "Villa", required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    reason: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const VillaBlockModel =
  models.VillaBlock ?? model("VillaBlock", VillaBlockSchema);
