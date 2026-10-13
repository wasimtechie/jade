import { Schema, model, models } from "mongoose";

const VillaNightlockSchema = new Schema(
  {
    villaId: { type: Schema.Types.ObjectId, ref: "Villa", required: true },
    date: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  },
  { timestamps: false },
);

VillaNightlockSchema.index({ villaId: 1, date: 1 }, { unique: true });

export const VillaNightlockModel =
  models.VillaNightlock ?? model("VillaNightlock", VillaNightlockSchema);
