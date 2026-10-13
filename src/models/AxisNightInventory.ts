import { Schema, models, model } from "mongoose";

/** Last known free units per hotel/room/night for Axis outbound inventory. */
const AxisNightInventorySchema = new Schema(
  {
    hotelId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    free: { type: Number, required: true, min: 0 },
    inventoryUnits: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true },
);

AxisNightInventorySchema.index(
  { hotelId: 1, roomId: 1, date: 1 },
  { unique: true },
);

export const AxisNightInventoryModel =
  models.AxisNightInventory ??
  model("AxisNightInventory", AxisNightInventorySchema);
